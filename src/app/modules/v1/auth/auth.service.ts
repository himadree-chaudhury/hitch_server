import bcrypt from "bcryptjs";
import { prisma } from "../../../configs/db";
import { User } from "../../../db/prisma/generated/prisma";
import { CustomError } from "../../../utils/error";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt";

const credentialLogin = async (payload: Pick<User, "email" | "password">) => {
  const isUserExist: User | null = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!isUserExist) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["No user found with the provided email."],
      hints: "Please check your credentials and try again.",
    });
    throw error;
  }

  const isPasswordMatch = await bcrypt.compare(
    payload.password as string,
    isUserExist.password as string
  );
  if (!isPasswordMatch) {
    const error = CustomError.unauthorized({
      message: "Invalid credentials",
      errors: ["The provided password is incorrect."],
      hints: "Please check your credentials and try again.",
    });
    throw error;
  }

  const jwtPayload = {
    id: isUserExist.id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const userAccessToken = generateAccessToken(jwtPayload);
  const userSessionToken = generateRefreshToken(jwtPayload);

  return {
    accessToken: userAccessToken,
    refreshToken: userSessionToken,
  };
};

const getNewAccessToken = async (payload: string) => {
  const isTokenValid = verifyRefreshToken(payload);
  if (!isTokenValid) {
    const error = CustomError.unauthorized({
      message: "Invalid or expired token.",
      errors: ["Refresh token is invalid or has expired."],
      hints: "Please login again to obtain a new refresh token.",
    });
    throw error;
  }
  const user: User | null = await prisma.user.findUnique({
    where: { email: isTokenValid.email },
  });
  if (!user) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["The user associated with the token does not exist."],
      hints: "Please check your credentials and try again.",
    });
    throw error;
  }

  if (user.isBlocked) {
    const error = CustomError.forbidden({
      message: "Access denied",
      errors: ["Your account is blocked or deleted."],
      hints: "Please contact support for further assistance.",
    });
    throw error;
  }
  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const newAccessToken = generateAccessToken(jwtPayload);
  const newRefreshToken = generateRefreshToken(jwtPayload);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const authService = {
  credentialLogin,
  getNewAccessToken,
};
