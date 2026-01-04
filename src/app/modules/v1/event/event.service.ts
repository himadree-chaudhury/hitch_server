import {
  Event,
  EventStatus,
  HostStatus,
  ParticipantStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../../../db/prisma";
import { CustomError } from "../../../utils/error";
import { sendMail } from "../../../utils/sendMail";
import { paymentService } from "../payment/payment.service";

const createEvent = async (
  hostId: string,
  payload: Event & { eventCategories: string[] }
) => {
  const host = await prisma.hostProfile.findUnique({
    where: { userId: hostId },
  });

  if (!host || host.hostStatus !== HostStatus.APPROVED) {
    const error = CustomError.badRequest({
      message: "Host profile not found",
      errors: ["You must have a host profile to create an event."],
      hints: "Please create a host profile and try again.",
    });
    throw error;
  }

  const slug =
    payload.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "") +
    "-" +
    Date.now();
  const { eventCategories, ...eventData } = payload;

  const response = await prisma.$transaction(async (tx) => {
    const event = await tx.event.create({
      data: {
        ...eventData,
        hostId,
        slug,
      },
    });

    if (eventCategories && eventCategories.length > 0) {
      await Promise.all(
        eventCategories.map(async (category) => {
          const createdCategory = await tx.eventCategory.upsert({
            where: { name: category },
            update: {},
            create: { name: category },
          });
          await tx.eventCategoryEvent.create({
            data: { eventId: event.id, eventCategoryId: createdCategory.id },
          });
        })
      );
    }

    return await tx.event.findUnique({
      where: { slug: event.slug },
      include: {
        eventCategories: {
          select: {
            eventCategory: {
              select: { name: true, id: true },
            },
          },
        },
      },
    });
  });

  return response;
};

const updateEvent = async (
  hostId: string,
  slug: string,
  payload: Partial<Event> & { eventCategories?: string[] }
) => {
  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) {
    const error = CustomError.notFound({
      message: "Event not found",
      errors: ["The event you are trying to update does not exist."],
      hints: "Please check the event slug and try again.",
    });
    throw error;
  }

  if (event.hostId !== hostId) {
    const error = CustomError.unauthorized({
      message: "Unauthorized",
      errors: ["You are not authorized to update this event."],
      hints: "Please check your credentials and try again.",
    });
    throw error;
  }

  const { eventCategories, ...eventData } = payload;

  let newSlug: string | undefined;
  if (eventData.title && eventData.title !== event.title) {
    newSlug =
      eventData.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "") +
      "-" +
      Date.now();
  }

  await prisma.$transaction(async (tx) => {
    await tx.event.update({
      where: { id: event.id },
      data: {
        ...eventData,
        slug: newSlug || event.slug,
      },
    });

    if (eventCategories && eventCategories.length > 0) {
      await tx.eventCategoryEvent.deleteMany({
        where: { eventId: event.id },
      });
      await Promise.all(
        eventCategories.map(async (category) => {
          const createdCategory = await tx.eventCategory.upsert({
            where: { name: category },
            update: {},
            create: { name: category },
          });
          await tx.eventCategoryEvent.create({
            data: { eventId: event.id, eventCategoryId: createdCategory.id },
          });
        })
      );
    }
  });

  return await prisma.event.findUnique({
    where: { id: event.id },
    include: {
      eventCategories: {
        select: {
          eventCategory: {
            select: { name: true, id: true },
          },
        },
      },
    },
  });
};

// 2. Get All Events (with filters)
const getAllEvents = async (query: any) => {
  const { search, type, city } = query;
  const whereConditions: Prisma.EventWhereInput = {
    status: EventStatus.UPCOMING, // Default to upcoming
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(type && { type }),
    ...(city && { city: { contains: city, mode: "insensitive" } }),
  };

  return await prisma.event.findMany({
    where: whereConditions,
    include: {
      eventCategory: true,
      host: { include: { user: { include: { userProfile: true } } } },
    },
    orderBy: { startTime: "asc" },
  });
};

// 3. Get Single Event
const getEventDetails = async (id: string) => {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      host: { include: { user: { include: { userProfile: true } } } },
      eventParticipants: { include: { user: true } },
      eventReviews: { include: { reviewer: true } },
    },
  });

  if (!event) throw CustomError.notFound({ message: "Event not found" });

  // Increment view count
  await prisma.event.update({
    where: { id },
    data: { totalViews: { increment: 1 } },
  });

  return event;
};

// 4. Join Event (Handles Payment Logic)
const joinEvent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { host: { include: { user: true } } },
  });

  if (!event) throw CustomError.notFound({ message: "Event not found" });
  if (event.status !== EventStatus.UPCOMING)
    throw CustomError.badRequest({ message: "Event is not open for joining" });
  if (
    event.maxParticipants &&
    event.currentParticipants >= event.maxParticipants
  ) {
    throw CustomError.badRequest({ message: "Event is full" });
  }

  const existingParticipant = await prisma.eventParticipant.findFirst({
    where: { eventId, userId },
  });
  if (existingParticipant)
    throw CustomError.badRequest({ message: "Already joined this event" });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userProfile: true },
  });

  // Case A: Free Event
  if (event.joiningFee === 0) {
    await prisma.$transaction(async (tx) => {
      await tx.eventParticipant.create({
        data: { userId, eventId, status: ParticipantStatus.CONFIRMED },
      });
      await tx.event.update({
        where: { id: eventId },
        data: { currentParticipants: { increment: 1 } },
      });
    });

    // Email Notifications

    await sendMail({
      to: user!.email,
      subject: "Event Joined Successfully",
      text: `You have successfully joined the event ${event.title}.`,
      html: `<p>You have successfully joined the event <strong>${event.title}</strong>.</p>`,
    });
    await sendMail({
      to: event.host.user.email,
      subject: "New Participant",
      text: `A new participant has joined your event ${event.title}.`,
      html: `<p>A new participant has joined your event <strong>${event.title}</strong>.</p>`,
    });

    return { message: "Joined successfully", paymentRequired: false };
  }

  // Case B: Paid Event
  else {
    // Call Payment Service to create Intent
    const paymentIntent = await paymentService.createPaymentIntent(
      userId,
      event,
      event.joiningFee
    );

    return {
      message: "Payment required",
      paymentRequired: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.paymentId,
    };
  }
};

// 5. Leave Event
const leaveEvent = async (userId: string, eventId: string) => {
  const participant = await prisma.eventParticipant.findFirst({
    where: { userId, eventId },
    include: { event: true, user: true }, // to get user email
  });

  if (!participant)
    throw CustomError.notFound({ message: "You are not a participant" });

  await prisma.$transaction([
    prisma.eventParticipant.delete({ where: { id: participant.id } }),
    prisma.event.update({
      where: { id: eventId },
      data: { currentParticipants: { decrement: 1 } },
    }),
  ]);

  // Notify User
  const userEmail = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (userEmail)
    await sendMail({
      to: userEmail.email,
      subject: "Left Event Successfully",
      text: `You have successfully left the event ${participant.event.title}.`,
      html: `<p>You have successfully left the event <strong>${participant.event.title}</strong>.</p>`,
    });

  return { message: "Left event successfully" };
};

// 6. Review Event
const reviewEvent = async (userId: string, eventId: string, payload: any) => {
  const participant = await prisma.eventParticipant.findUnique({
    where: { userId, eventId }, // Assuming compound unique key in schema or findFirst
  });

  // Note: Schema provided has `eventId` @unique and `userId` @unique in EventParticipant which implies 1 user 1 event globally?
  // *Correction*: Usually EventParticipant has @@unique([userId, eventId]). Assuming logical fix here.

  if (!participant || participant.status !== ParticipantStatus.CONFIRMED) {
    throw CustomError.badRequest({
      message: "You must attend the event to review it",
    });
  }

  // Create Review
  await prisma.eventReview.create({
    data: {
      reviewerId: userId, // Adjusting based on standard schema, schema provided uses reviewerId
      eventId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });

  // Recalculate Average Rating
  const aggregations = await prisma.eventReview.aggregate({
    where: { eventId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.event.update({
    where: { id: eventId },
    data: {
      rating: Math.round(aggregations._avg.rating || 0),
      reviewCount: aggregations._count.rating,
    },
  });

  return { message: "Review added successfully" };
};

// 7. Change Event Status (Host/Admin)
const changeEventStatus = async (
  userId: string,
  eventId: string,
  status: EventStatus
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      eventParticipants: { include: { user: { include: { user: true } } } },
    },
  });

  if (!event) throw CustomError.notFound({ message: "Event not found" });
  if (event.hostId !== userId)
    throw CustomError.unauthorized({ message: "Only host can change status" });

  await prisma.event.update({ where: { id: eventId }, data: { status } });

  // Bulk Email Notification
  if (status === EventStatus.CANCELLED || status === EventStatus.ONGOING) {
    for (const p of event.eventParticipants) {
      if (p.user?.user?.email) {
        await sendMail({
          to: p.user.user.email,
          subject: `Event Status Changed: ${status}`,
          text: `The status of the event ${event.title} has been changed to ${status}.`,
          html: `<p>The status of the event <strong>${event.title}</strong> has been changed to <strong>${status}</strong>.</p>`,
        });
      }
    }
  }

  return { message: `Event status updated to ${status}` };
};

export const eventService = {
  createEvent,
  updateEvent,
  getAllEvents,
  getEventDetails,
  joinEvent,
  leaveEvent,
  reviewEvent,
  changeEventStatus,
};
