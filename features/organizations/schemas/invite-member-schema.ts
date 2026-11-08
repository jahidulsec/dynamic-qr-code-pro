import { z } from "zod";

// a system or custom role key; the server checks it exists in the organization
export const memberRoleSchema = z
  .string("Choose a valid role")
  .trim()
  .regex(/^[a-z0-9-]{1,64}$/, "Choose a valid role");

export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  role: memberRoleSchema,
});

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
