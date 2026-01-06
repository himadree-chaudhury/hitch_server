import { EventStatus, EventType } from "@prisma/client";
import z from "zod";

export const createEventSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters"),
  type: z.enum(EventType),
  eventCategories: z
    .array(z.string())
    .min(1, "At least one category is required"),
  description: z.string().optional(),
  startTime: z.coerce.date("Start time must be a valid date"),
  endTime: z.coerce.date("End time must be a valid date"),
  city: z.string("City is required"),
  country: z.string("Country is required"),
  address: z.string("Address is required"),
  minParticipants: z.number().min(1),
  maxParticipants: z.number().optional(),
  joiningFee: z.number().min(0, "Joining fee must be at least 0"),
  currency: z.string().default("USD"),
  imageUrl: z.url("This must be a valid URL").optional(),
});

export const updateEventSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be at most 100 characters")
    .optional(),
  type: z.enum(EventType).optional(),
  eventCategories: z
    .array(z.string())
    .min(1, "At least one category is required")
    .optional(),
  description: z.string().optional(),
  startTime: z.coerce.date("Start time must be a valid date").optional(),
  endTime: z.coerce.date("End time must be a valid date").optional(),
  city: z.string("City is required").optional(),
  country: z.string("Country is required").optional(),
  address: z.string("Address is required").optional(),
  minParticipants: z.number().min(1).optional(),
  maxParticipants: z.number().optional(),
  joiningFee: z.number().min(0, "Joining fee must be at least 0").optional(),
  currency: z.string().default("USD").optional(),
  imageUrl: z.url("This must be a valid URL").optional(),
});

export const eventReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export const changeStatusSchema = z.object({
  status: z.enum(EventStatus),
});
