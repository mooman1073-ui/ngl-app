import { z } from "zod";

export const registerDTO = z.object({
  name: z.string().trim().min(3).max(20),
  email: z.email().trim().toLowerCase(),
  password: z.string().trim().min(8).max(16),
  dob: z.coerce.date().optional(),
  gender: z.enum(["Male", "Female"]).optional()
});

export const verifyEmailDTO = z.object({
  email: z.email().trim().toLowerCase(),
  otp: z.string().trim().length(6)
});

export const loginDTO = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().trim().min(8).max(16)
});

export const resendOtpDTO = z.object({
  email: z.email().trim().toLowerCase()
});

export const sendResetOtpDTO = z.object({
  email: z.email().trim().toLowerCase()
});

export const resetPasswordDTO = z.object({
  email: z.email().trim().toLowerCase(),
  otp: z.string().trim().length(6),
  newPassword: z.string().trim().min(8).max(16)
});
