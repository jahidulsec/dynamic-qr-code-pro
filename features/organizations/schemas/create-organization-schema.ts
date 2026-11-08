import { z } from "zod";

// slugs live at the URL root, so they can't shadow a top-level route
const reservedSlugs = [
  "api",
  "organizations",
  "sign-in",
  "sign-up",
  "verify-email",
  "forgot-password",
  "accept-invitation",
  "no-organization",
  "session-expired",
];

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  slug: z
    .string()
    .trim()
    .min(3, "URL must be at least 3 characters")
    .max(48, "URL must be at most 48 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens")
    .refine((slug) => !reservedSlugs.includes(slug), "This URL is reserved"),
});

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/, "");
