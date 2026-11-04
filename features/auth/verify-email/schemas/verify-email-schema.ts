import { z } from "zod";

export const verifyEmailSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email"),
});

export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
