import { z } from "zod";

// the one password rule for sign-up, password change and reset; Better Auth enforces the same 8–128 bounds
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");
