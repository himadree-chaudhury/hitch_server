import { HostStatus, UserRole } from "@prisma/client";
import { prisma } from "../../../db/prisma";
import { CustomError } from "../../../utils/error";

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

  const host = await prisma.hostProfile.create({
    data: {
      userId: user.id,
    },
  });
  return host;
};

const toggleHostRole = async (email: string) => {
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

  const host = await prisma.hostProfile.findUnique({
    where: { userId: user.id },
  });
    if (!host) {
    const error = CustomError.notFound({
      message: "Host profile not found",
      errors: ["The requested host profile does not exist."],
      hints: "Please check the user ID and try again.",
    });
    throw error;
  }

  await prisma.$transaction(async (tx) => {
    const userUpdate = await tx.user.update({
      where: { email: email },
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
};

export const hostService = {
  requestToBeHost,
  toggleHostRole,
};
