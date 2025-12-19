import { NextFunction, Request, Response } from "express";
import { prisma } from "../configs/db";
import { CustomError } from "../utils/error";
import { verifyAccessToken } from "../utils/jwt";
import { UserStatus } from "../types/user.type";
import { User } from "@prisma/client";

export const checkAuth =
  (...allowedRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken =
        req.headers.authorization?.split(" ")[1] || req.cookies.accessToken;
      if (!accessToken) {
        const error = CustomError.badRequest({
          message: "Access token is missing",
          errors: ["Access token is required for authentication."],
          hints:
            "Please provide a valid access token in the Authorization header or as a cookie.",
        });
        return next(error);
      }

      const isTokenValid = verifyAccessToken(accessToken);
      // console.log(isTokenValid);
      if (!isTokenValid) {
        const error = CustomError.unauthorized({
          message: "Invalid or expired token.",
          errors: ["Access token is invalid or has expired."],
          hints: "Please login again to obtain a new access token.",
        });
        return next(error);
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
        return next(error);
      }
      if (user.status === UserStatus.BLOCKED || user.status === UserStatus.BANNED) {
        const error = CustomError.forbidden({
          message: "Access denied",
          errors: ["Your account is blocked or deleted."],
          hints: "Please contact support for further assistance.",
        });
        return next(error);
      }

      if (!allowedRoles.includes(isTokenValid.role)) {
        const error = CustomError.forbidden({
          message: "Access denied",
          errors: ["You do not have permission to access this resource."],
          hints: "Please contact support if you believe this is an error.",
        });
        return next(error);
      }
      req.authUser = isTokenValid;
      next();
    } catch (error) {
      return next(error);
    }
  };
