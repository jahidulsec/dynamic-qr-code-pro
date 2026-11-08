import { z } from "zod";

// keep the password rules in sync with signUpSchema
const newPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
    revokeOtherSessions: z.boolean(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "Choose a password different from your current one",
    path: ["newPassword"],
  });

export const sessionIdSchema = z.string().trim().min(1, "Invalid session");

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
