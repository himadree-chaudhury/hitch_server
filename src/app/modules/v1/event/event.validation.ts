import z from "zod";
import { EventType, EventStatus } from "@prisma/client";

export const createEventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  type: z.nativeEnum(EventType),
  eventCategoryId: z.string().uuid(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  city: z.string(),
  country: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  minParticipants: z.number().min(1),
  maxParticipants: z.number().optional(),
  joiningFee: z.number().min(0),
  currency: z.string().default("USD"),
  imageUrl: z.string().url().optional(),
});

export const updateEventSchema = createEventSchema.partial().extend({
  status: z.nativeEnum(EventStatus).optional(),
});

export const eventReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export const changeStatusSchema = z.object({
  status: z.nativeEnum(EventStatus),
});
