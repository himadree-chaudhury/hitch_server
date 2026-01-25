import z from "zod";

export const reviewHostSchema = z.object({
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment cannot exceed 500 characters"),
});
