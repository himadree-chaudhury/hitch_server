import bcrypt from "bcryptjs";
import { prisma } from "../../../configs/db";
import envVariables from "../../../configs/env";
import { User } from "../../../db/prisma/generated/prisma";
import { CustomError } from "../../../utils/error";

const credentialRegister = async (
  payload: Pick<User, "name" | "email" | "password">
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
    envVariables.SALT_ROUNDS
  );

  const newUser: Pick<User, "name" | "email" | "password"> = {
    ...payload,
    password: hashedPassword,
  };

  await prisma.user.create({
    data: newUser,
  });
};

const getUser = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      isBlocked: true,
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

export const userService = {
  credentialRegister,
  getUser,
};
