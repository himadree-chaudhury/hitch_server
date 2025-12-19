import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { ZodError } from "zod";
import { Prisma } from "../db/prisma/generated/prisma";
import { CustomError } from "../utils/error";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = {
    status: err.status || httpStatus.INTERNAL_SERVER_ERROR,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    hints: err.hints || "An unexpected error occurred.",
  };

  // Handle JWT token expiration error
  if (err.name === "TokenExpiredError") {
    error = {
      ...error,
      status: httpStatus.UNAUTHORIZED,
      message: "Token has expired.",
      hints: "Please login again to obtain a new access token.",
    };
  }
  // Handle Zod validation errors
  else if (err instanceof ZodError) {
    error = {
      ...error,
      status: httpStatus.BAD_REQUEST,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field:
          issue.path.length > 1
            ? `${issue.path.reverse().join(" inside ")} missing`
            : `${issue.path.join(".")} is missing`,
        message: issue.message,
        code: issue.code,
      })),
      hints: "Please check the request data and try again.",
    };
  }
  // Handle Prisma errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        error = {
          ...error,
          status: httpStatus.CONFLICT,
          message: `Duplicate entry for ${err.meta?.target || "field"}.`,
          hints:
            "Ensure the field (e.g., email, slug, category name, or tag name) is unique.",
        };
        break;
      case "P2025": // Record not found
        error = {
          ...error,
          status: httpStatus.NOT_FOUND,
          message: "Record not found.",
          hints:
            "The requested resource (e.g., post, user, category) does not exist.",
        };
        break;
      case "P2003": // Foreign key constraint failed
        error = {
          ...error,
          status: httpStatus.BAD_REQUEST,
          message: "Foreign key constraint failed.",
          hints: "Ensure referenced records (e.g., author or post) exist.",
        };
        break;
      case "P2004": // General constraint failure
        error = {
          ...error,
          status: httpStatus.BAD_REQUEST,
          message: "Database constraint failed.",
          hints: "Check the data against database constraints.",
        };
        break;
      default:
        error = {
          ...error,
          status: httpStatus.BAD_REQUEST,
          message: "Database error occurred.",
          errors: [err.message],
          hints: "Please check the request data or contact support.",
        };
    }
  }
  // Handle Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    error = {
      ...error,
      status: httpStatus.BAD_REQUEST,
      message: "Invalid data provided.",
      errors: [err.message],
      hints:
        "Verify the data format and required fields (e.g., title, content).",
    };
  }
  // Handle Prisma initialization or connection errors
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    error = {
      ...error,
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: "Database connection failed.",
      hints: "Please check the database configuration or contact support.",
    };
  }
  // Handle custom errors
  else if (err instanceof CustomError) {
    error = {
      ...error,
    };
  }

  res.status(error.status).json(error);
  next(err);
};
