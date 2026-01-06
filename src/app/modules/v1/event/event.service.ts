import {
  Event,
  EventReview,
  EventStatus,
  HostStatus,
  ParticipantStatus,
  PaymentStatus,
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

const getAllEvents = async (query: any) => {
  const { search, type, city } = query;
  const whereConditions: Prisma.EventWhereInput = {
    status: EventStatus.UPCOMING || EventStatus.ONGOING,
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
      eventCategories: {
        select: {
          eventCategory: {
            select: { name: true, id: true },
          },
        },
      },
      host: { select: { user: { select: { userProfile: true } } } },
    },
    orderBy: { startTime: "asc" },
  });
};

const getEventDetails = async (slug: string) => {
  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) {
    const error = CustomError.notFound({
      message: "Event not found",
      errors: ["The requested event does not exist."],
      hints: "Please check the event slug and try again.",
    });
    throw error;
  }

  const updatedEvent = await prisma.event.update({
    where: { slug },
    data: { totalViews: { increment: 1 } },
    include: {
      host: { select: { user: { select: { userProfile: true } } } },
      eventParticipants: {
        select: {
          user: {
            select: { user: { select: { userProfile: true } } },
          },
        },
      },
      eventReviews: { select: { reviewer: true } },
      eventCategories: {
        select: {
          eventCategory: {
            select: { name: true, id: true },
          },
        },
      },
    },
  });

  return updatedEvent;
};

const changeEventStatus = async (
  hostId: string,
  slug: string,
  status: EventStatus
) => {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      eventParticipants: {
        select: { user: { select: { user: { select: { email: true } } } } },
      },
    },
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

  const response = await prisma.event.update({
    where: { slug, id: event.id },
    data: { status },
  });

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
  return response;
};

const joinEvent = async (userId: string, slug: string) => {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: { host: { include: { user: true } } },
  });

  if (!event) {
    const error = CustomError.notFound({
      message: "Event not found",
      errors: ["The event you are trying to join does not exist."],
      hints: "Please check the event slug and try again.",
    });
    throw error;
  }
  if (
    event.status !== EventStatus.UPCOMING &&
    event.status !== EventStatus.ONGOING
  ) {
    const error = CustomError.badRequest({
      message: "Cannot join event",
      errors: ["You can only join upcoming or ongoing events."],
      hints: "Please check the event status and try again.",
    });
    throw error;
  }
  if (
    event.maxParticipants &&
    event.currentParticipants >= event.maxParticipants
  ) {
    const error = CustomError.badRequest({
      message: "Event full",
      errors: ["The event has reached its maximum participant limit."],
      hints: "Please try joining another event.",
    });
    throw error;
  }

  const existingParticipant = await prisma.eventParticipant.findFirst({
    where: { eventId: event.id, userId },
  });
  if (existingParticipant) {
    const error = CustomError.conflict({
      message: "Already joined",
      errors: ["You have already joined this event."],
      hints: "Please check your joined events.",
    });
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userProfile: true },
  });
  if (!user) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["The user trying to join the event does not exist."],
      hints: "Please check the user credentials and try again.",
    });
    throw error;
  }

  // Case A: Free Event
  if (event.joiningFee === 0) {
    await prisma.$transaction(async (tx) => {
      await tx.eventParticipant.create({
        data: {
          eventId: event.id,
          userId,
          status: ParticipantStatus.PAID,
        },
      });
      await tx.event.update({
        where: { slug },
        data: { currentParticipants: { increment: 1 } },
      });
    });

    await sendMail({
      to: user!.email,
      subject: "Event Joined Successfully",
      text: `You have successfully joined the event ${event.title}.`,
      html: `<p>You have successfully joined the event <strong>${event.title}</strong>. To query the host, please contact ${event.host.user.email}.</p>`,
    });
    await sendMail({
      to: event.host.user.email,
      subject: "New Participant",
      text: `A new participant has joined your event ${event.title}.`,
      html: `<p>${
        user!.userProfile?.firstName + " " + user!.userProfile?.lastName
      } has joined your event <strong>${
        event.title
      }</strong>. Participant mail: ${user!.email}</p>`,
    });

    return { paymentRequired: false };
  }

  // Case B: Paid Event
  else {
    const paymentIntent = await paymentService.createPaymentIntent(
      user.id,
      user.email,
      event,
      event.joiningFee
    );

    return paymentIntent;
  }
};

const leaveEvent = async (userId: string, slug: string) => {
  const event = await prisma.event.findUnique({
    where: { slug },
  });

  if (!event) {
    const error = CustomError.notFound({
      message: "Event not found",
      errors: ["The event you are trying to leave does not exist."],
      hints: "Please check the event slug and try again.",
    });
    throw error;
  }

  const participant = await prisma.eventParticipant.findFirst({
    where: { userId, eventId: event.id },
    include: {
      event: true,
      user: { select: { user: { select: { email: true } } } },
      payment: true,
    },
  });

  if (!participant) {
    const error = CustomError.badRequest({
      message: "Not a participant",
      errors: ["You are not a participant of this event."],
      hints: "Please check your joined events.",
    });
    throw error;
  }
  if (
    participant.status === ParticipantStatus.CANCELLED &&
    participant.payment?.status === PaymentStatus.CANCELLED
  ) {
    const error = CustomError.badRequest({
      message: "Already left",
      errors: ["You have already left this event."],
      hints: "Please check your joined events.",
    });
    throw error;
  }

  const response = await prisma.$transaction(async (tx) => {
    const participantUpdate = await tx.eventParticipant.update({
      where: { eventId: event.id, userId },
      data: { status: ParticipantStatus.CANCELLED },
      include: { payment: true },
    });

    await tx.event.update({
      where: { id: event.id },
      data: { currentParticipants: { decrement: 1 } },
    });
    await tx.payment.update({
      where: { id: participant.payment?.id },
      data: { status: PaymentStatus.CANCELLED },
    });

    return participantUpdate;
  });

  await sendMail({
    to: participant.user.user.email,
    subject: "Left Event Successfully",
    text: `You have successfully left the event ${participant.event.title}.`,
    html: `<p>You have successfully left the event <strong>${participant.event.title}</strong>.</p>`,
  });

  return response;
};

const reviewEvent = async (
  userId: string,
  slug: string,
  payload: EventReview
) => {
  const event = await prisma.event.findUnique({
    where: { slug },
  });
  if (!event) {
    const error = CustomError.notFound({
      message: "Event not found",
      errors: ["The event you are trying to review does not exist."],
      hints: "Please check the event slug and try again.",
    });
    throw error;
  }

  const participant = await prisma.eventParticipant.findUnique({
    where: { userId, eventId: event.id },
  });

  if (
    !participant ||
    participant.status !== ParticipantStatus.PAID ||
    event.status !== EventStatus.COMPLETED
  ) {
    const error = CustomError.badRequest({
      message: "Cannot review event",
      errors: [
        "You can only review events you have participated in and that are completed.",
      ],
      hints: "Please check your participated events.",
    });
    throw error;
  }

  const existingReview = await prisma.eventReview.findFirst({
    where: { reviewerId: userId, eventId: event.id },
  });
  if (existingReview) {
    const error = CustomError.conflict({
      message: "Already reviewed",
      errors: ["You have already reviewed this event."],
      hints: "Please check your reviews.",
    });
    throw error;
  }

  const response = prisma.$transaction(async (tx) => {
    const review = await tx.eventReview.create({
      data: {
        reviewerId: userId,
        eventId: event.id,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const aggregations = await tx.eventReview.aggregate({
      where: { eventId: event.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.event.update({
      where: { id: event.id },
      data: {
        rating: aggregations._avg.rating || 0,
        reviewCount: aggregations._count.rating,
      },
    });

    return review;
  });

  return response;
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
