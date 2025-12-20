import { Gender } from "@prisma/client";
import z from "zod";

export const userValidationSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string("Please enter a password")
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

export const userProfileValidationSchema = z.object({
  firstName: z
    .string()
    .max(50, "First name must be at most 50 characters long")
    .optional(),
  lastName: z
    .string()
    .max(50, "Last name must be at most 50 characters long")
    .optional(),
  interests: z
    .array(
      z.string().max(30, "Each interest must be at most 30 characters long")
    )
    .optional(),
  bio: z
    .string()
    .max(300, "Bio must be at most 300 characters long")
    .optional(),
  imageUrl: z.url("Please enter a valid URL").optional(),
  gender: z.enum(Gender).optional(),
  city: z
    .string()
    .max(50, "City must be at most 50 characters long")
    .optional(),
  country: z
    .string()
    .max(50, "Country must be at most 50 characters long")
    .optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
