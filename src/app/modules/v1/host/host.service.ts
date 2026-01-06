import {
  EventStatus,
  HostReview,
  HostStatus,
  ParticipantStatus,
  UserRole,
} from "@prisma/client";
import { prisma } from "../../../db/prisma";
import { CustomError } from "../../../utils/error";

const getHostProfile = async (userId: string) => {
  const hostProfile = await prisma.hostProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          userProfile: {
            select: {
              firstName: true,
              lastName: true,
              bio: true,
              hostReviews: true,
              eventReviews: true,
              eventsJoined: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!hostProfile) {
    const error = CustomError.notFound({
      message: "Host profile not found",
      errors: ["The requested host profile does not exist."],
      hints: "Please check the user ID and try again.",
    });
    throw error;
  }

  return hostProfile;
};

const requestToBeHost = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["The requested user does not exist."],
      hints: "Please check the email and try again.",
    });
    throw error;
  }

  if (user.role === UserRole.HOST || !user.verification) {
    const error = CustomError.badRequest({
      message: "Invalid request",
      errors: ["The user is either already a host or not verified."],
      hints: "Only verified users can request to become hosts.",
    });
    throw error;
  }

  const existingHost = await prisma.hostProfile.findUnique({
    where: { userId: user.id },
  });

  if (existingHost && existingHost.hostStatus === HostStatus.PENDING) {
    const error = CustomError.conflict({
      message: "Host request already pending",
      errors: ["A host request is already pending for this user."],
      hints: "Please wait for the existing request to be processed.",
    });
    throw error;
  }

  const host = await prisma.hostProfile.create({
    data: {
      userId: user.id,
    },
  });
  return host;
};

const toggleHostRole = async (hostId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: hostId },
  });
  if (!user) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["The requested user does not exist."],
      hints: "Please check the email and try again.",
    });
    throw error;
  }

  const host = await prisma.hostProfile.findUnique({
    where: { userId: hostId },
  });
  if (!host) {
    const error = CustomError.notFound({
      message: "Host profile not found",
      errors: ["The requested host profile does not exist."],
      hints: "Please check the user ID and try again.",
    });
    throw error;
  }

  const response = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        role: user.role === UserRole.HOST ? UserRole.USER : UserRole.HOST,
      },
    });
    const hostUpdate = await tx.hostProfile.update({
      where: { userId: user.id },
      data: {
        hostStatus:
          host?.hostStatus === HostStatus.APPROVED
            ? HostStatus.REJECTED
            : HostStatus.APPROVED,
      },
    });
    return hostUpdate;
  });

  return response;
};

const reviewHost = async (
  userId: string,
  slug: string,
  payload: HostReview
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

  const participant = await prisma.eventParticipant.findFirst({
    where: { userId, eventId: event.id },
  });

  if (
    !participant ||
    participant.status !== ParticipantStatus.PAID ||
    event.status !== EventStatus.COMPLETED
  ) {
    const error = CustomError.badRequest({
      message: "Cannot review host",
      errors: [
        "You can only review the host of an event you have participated in and completed after the event has concluded.",
      ],
      hints:
        "Please ensure you have completed the event before reviewing the host or check your event status.",
    });
    throw error;
  }

  const existingReview = await prisma.hostReview.findFirst({
    where: {
      reviewerId: userId,
      eventId: event.id,
      hostId: event.hostId,
    },
  });

  if (existingReview) {
    const error = CustomError.conflict({
      message: "Already reviewed",
      errors: ["You have already reviewed this event."],
      hints: "Please check your reviews.",
    });
    throw error;
  }

  const response = await prisma.$transaction(async (tx) => {
    const review = await tx.hostReview.create({
      data: {
        reviewerId: userId,
        eventId: event.id,
        hostId: event.hostId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    const aggregations = await tx.hostReview.aggregate({
      where: { hostId: event.hostId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.hostProfile.update({
      where: { userId: event.hostId },
      data: {
        rating: aggregations._avg.rating || 0,
        ratingCount: aggregations._count.rating,
      },
    });

    return review;
  });

  return response;
};

export const hostService = {
  getHostProfile,
  requestToBeHost,
  toggleHostRole,
  reviewHost,
};
