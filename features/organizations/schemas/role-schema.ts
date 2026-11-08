import { z } from "zod";

import { roleKeyFromLabel } from "@/features/organizations/libs/roles";
import { isSystemRole, normalizePermissions, statements, type Permissions } from "@/lib/auth/permissions";

const permissionsSchema = z
  .record(z.string(), z.array(z.string()))
  .transform((value): Permissions => normalizePermissions(value))
  .refine((value) => Object.keys(value).length > 0, "Grant at least one permission");

export const roleFormSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters")
    .max(48, "Use at most 48 characters")
    .refine((label) => roleKeyFromLabel(label).length > 0, "Use letters or numbers")
    .refine((label) => !isSystemRole(roleKeyFromLabel(label)), "That name belongs to a built-in role"),
  description: z.string().trim().max(255, "Use at most 255 characters"),
  permissions: permissionsSchema,
});

export type RoleFormInput = z.input<typeof roleFormSchema>;
export type RoleFormValues = z.output<typeof roleFormSchema>;
// actions re-parse whatever they're sent, so the form may submit its parsed values
export type RoleFormSubmit = RoleFormInput | RoleFormValues;

export const roleKeySchema = z.string().regex(/^[a-z0-9-]{1,64}$/, "Role not found");

// every resource with an empty grant list, for the editor's initial state
export const emptyPermissionInput = (): Record<string, string[]> =>
  Object.fromEntries(Object.keys(statements).map((resource) => [resource, []]));
