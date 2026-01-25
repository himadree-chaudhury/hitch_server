import bcrypt from "bcryptjs";

import { Provider, User, UserProfile, UserStatus } from "@prisma/client";
import { envSecrets } from "../../../configs/env";
import { prisma } from "../../../db/prisma";
import { CustomError } from "../../../utils/error";

const credentialRegister = async (
  payload: Pick<User, "email" | "password">,
) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (isUserExist) {
    const error = CustomError.conflict({
      message: "Email already in use",
      errors: ["A user with this email already exists."],
      hints: "Please check the email and try again.",
    });
    throw error;
  }
  const hashedPassword = await bcrypt.hash(
    payload.password as string,
    envSecrets.SALT_ROUNDS,
  );

  const newUser: Pick<User, "email" | "password" | "provider"> = {
    ...payload,
    password: hashedPassword,
    provider: Provider.CREDENTIALS,
  };

  const response = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: newUser,
      select: {
        id: true,
        email: true,
        provider: true,
        verification: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await tx.userProfile.create({
      data: { userId: createdUser.id },
    });
    return createdUser;
  });
  return response;
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      provider: true,
      verification: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users;
};

const getUser = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      provider: true,
      verification: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["The requested user does not exist."],
      hints: "Please check the email and try again.",
    });
    throw error;
  }

  return user;
};

const getUserProfile = async (userId: string) => {
  const user = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      eventsJoined: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
        },
      },
      payments: {
        include: {
          event: {
            select: {
              title: true,
            },
          },
        },
      },
      hostReviews: {
        include: {
          host: {
            select: {
              user: {
                select: {
                  userProfile: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          event: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
      eventReviews: {
        include: {
          event: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    const error = CustomError.notFound({
      message: "User profile not found",
      errors: ["The requested user profile does not exist."],
      hints: "Please check the user ID and try again.",
    });
    throw error;
  }

  return user;
};

const updateUserProfile = async (userId: string, payload: UserProfile) => {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });
  if (!userProfile) {
    const error = CustomError.conflict({
      message: "User profile already exists",
      errors: ["A user profile with this user ID already exists."],
      hints: "Please check the user ID and try again.",
    });
    throw error;
  }

  const newUserProfile = await prisma.userProfile.update({
    where: { userId },
    data: { ...payload },
  });
  return newUserProfile;
};

const toggleUserStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["The requested user does not exist."],
      hints: "Please check the user ID and try again.",
    });
    throw error;
  }
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      status:
        user.status === UserStatus.ACTIVE
          ? UserStatus.BLOCKED
          : UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      provider: true,
      verification: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return updatedUser;
};

export const userService = {
  credentialRegister,
  getUser,
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  toggleUserStatus,
};
