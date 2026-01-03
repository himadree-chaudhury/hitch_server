import z from "zod";

export const authValidationSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string("Please enter a password"),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string("Old password is required"),
  newPassword: z
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

export const forgetPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
  otp: z.string().min(6, "OTP is required"),
  newPassword: z
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

export const verifyAccountSchema = z.object({
  email: z.email("Please enter a valid email address"),
  otp: z.string().min(6, "OTP is required"),
});
