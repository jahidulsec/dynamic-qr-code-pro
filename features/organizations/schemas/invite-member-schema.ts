import { z } from "zod";

import { ORGANIZATION_ROLES } from "@/features/organizations/libs/roles";

export const memberRoleSchema = z.enum(ORGANIZATION_ROLES, "Choose a valid role");

export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  role: memberRoleSchema,
});

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
