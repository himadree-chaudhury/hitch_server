import { Provider, User, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { envSecrets } from "../../../configs/env";
import { redisClient } from "../../../configs/redis";
import { prisma } from "../../../db/prisma";
import { CustomError } from "../../../utils/error";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt";
import { sendMail } from "../../../utils/sendMail";

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

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const newAccessToken = generateAccessToken(jwtPayload);
  const newRefreshToken = generateRefreshToken(jwtPayload);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

const changePassword = async (
  userEmail: string,
  payload: { oldPassword: string; newPassword: string }
) => {
  const user = await prisma.user.findUnique({ where: { email: userEmail } });

  if (!user || !user.password) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["No user found with the provided email."],
      hints: "Please check your credentials and try again.",
    });
    throw error;
  }

  const isMatch = await bcrypt.compare(payload.oldPassword, user.password);
  if (!isMatch) {
    const error = CustomError.unauthorized({
      message: "Old password is incorrect",
      errors: ["The provided old password does not match our records."],
      hints: "Please check your old password and try again.",
    });
    throw error;
  }

  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    envSecrets.SALT_ROUNDS
  );

  await prisma.user.update({
    where: { email: userEmail },
    data: { password: hashedPassword },
  });
};

const forgetPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.provider !== Provider.CREDENTIALS) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["No user found with the provided email."],
      hints: "Please check your credentials and try again.",
    });
    throw error;
  }

  const otp = crypto.randomInt(10 ** 5, 10 ** 6).toString();

  const redisKey = `${user?.role}[${user?.id}]:${user?.email}`;
  await redisClient.set(redisKey, otp, {
    expiration: {
      type: "EX",
      value: 5 * 60, // 5 minutes
    },
  });

  const emailBody = {
    to: `${user?.email}`,
    subject: "Verify your email",
    text: `Your verification code is ${otp}. It will expire in 2 minutes.`,
    html: `<p>Your verification code is <strong>${otp}</strong>. It will expire in 2 minutes.</p>`,
  };

  await sendMail(emailBody);
};

const resetPassword = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["No user found with the provided email."],
      hints: "Please check your credentials and try again.",
    });
    throw error;
  }

  const redisKey = `${user?.role}[${user?.id}]:${user?.email}`;
  const storedOtp = await redisClient.get(redisKey);

  if (!storedOtp || storedOtp !== payload.otp) {
    const error = CustomError.badRequest({
      message: "Invalid or expired OTP",
      errors: ["The provided OTP is incorrect or has expired."],
      hints: "Please request a new OTP and try again.",
    });
    throw error;
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  await prisma.user.update({
    where: { email: payload.email },
    data: { password: hashedPassword },
  });

  await redisClient.del(redisKey);
};

const requestVerification = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["No user found with the provided email."],
      hints: "Please check your credentials and try again.",
    });
    throw error;
  }
  if (user.verification) {
    const error = CustomError.badRequest({
      message: "Account already verified",
      errors: ["The account associated with this email is already verified."],
      hints: "No further action is required.",
    });
    throw error;
  }

  const verificationCode = crypto.randomInt(10 ** 5, 10 ** 6).toString();

  const redisKey = `${user?.role}[${user?.id}]:${user?.email}`;
  await redisClient.set(redisKey, verificationCode, {
    expiration: {
      type: "EX",
      value: 5 * 60, // 5 minutes
    },
  });
  const emailBody = {
    to: `${user?.email}`,
    subject: "Verify your email",
    text: `Your verification code is ${verificationCode}. It will expire in 5 minutes.`,
    html: `<p>Your verification code is <strong>${verificationCode}</strong>. It will expire in 5 minutes.</p>`,
  };

  await sendMail(emailBody);
};

const verifyAccount = async (email: string, payload: { otp: string }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = CustomError.notFound({
      message: "User not found",
      errors: ["No user found with the provided email."],
      hints: "Please check your credentials and try again.",
    });
    throw error;
  }
  const redisKey = `${user?.role}[${user?.id}]:${user?.email}`;
  const storedOtp = await redisClient.get(redisKey);

  if (!storedOtp || storedOtp !== payload.otp) {
    const error = CustomError.badRequest({
      message: "Invalid or expired OTP",
      errors: ["The provided OTP is incorrect or has expired."],
      hints: "Please request a new OTP and try again.",
    });
    throw error;
  }

  await prisma.user.update({
    where: { email },
    data: { verification: true, status: UserStatus.ACTIVE },
  });

  await redisClient.del(redisKey);
};


const googleLogin = async (profile: any) => {
  const email = profile.emails[0].value;

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Create new user via Google
    user = await prisma.user.create({
      data: {
        email,
        provider: Provider.GOOGLE,
        verification: true,
        userProfile: {
          create: {
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            imageUrl: profile.photos[0].value,
          },
        },
      },
    });
  } else if (user.provider !== Provider.GOOGLE) {
    // Optional: Merge account or throw error
    throw CustomError.badRequest({
      message: "Email already registered with different provider",
    });
  }

  const jwtPayload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  return { accessToken, refreshToken };
};

export const authService = {
  credentialLogin,
  getNewAccessToken,
  changePassword,
  forgetPassword,
  resetPassword,
  requestVerification,
  verifyAccount,
  googleLogin,
};
