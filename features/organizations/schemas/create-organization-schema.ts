import { z } from "zod";

// slugs live at the URL root, so they can't shadow a top-level route — current or future.
// Add every new top-level route here. Slugs under 3 characters (e.g. "q") are already rejected by length.
const reservedSlugs = new Set([
  // current app routes
  "api",
  "organizations",
  "sign-in",
  "sign-up",
  "verify-email",
  "forgot-password",
  "reset-password",
  "accept-invitation",
  "no-organization",
  "session-expired",

  // admin and internal
  "admin",
  "administrator",
  "dashboard",
  "console",
  "internal",
  "system",
  "root",
  "staff",
  "superuser",
  "sudo",
  "moderator",
  "monitoring",
  "status",
  "health",
  "healthz",
  "metrics",
  "debug",
  "graphql",
  "webhook",
  "webhooks",
  "callback",
  "oauth",
  "auth",
  "sso",
  "saml",
  "cron",
  "jobs",
  "queue",

  // account and auth
  "account",
  "accounts",
  "profile",
  "settings",
  "login",
  "logout",
  "signin",
  "signup",
  "signout",
  "sign-out",
  "register",
  "join",
  "invite",
  "invitation",
  "invitations",
  "verify",
  "confirm",
  "password",
  "onboarding",
  "welcome",
  "user",
  "users",
  "me",
  "new",

  // product
  "app",
  "apps",
  "qr",
  "qrs",
  "qr-code",
  "qr-codes",
  "scan",
  "link",
  "links",
  "check",
  "reports",
  "analytics",
  "tags",
  "trash",
  "billing",
  "pricing",
  "plans",
  "checkout",
  "subscribe",
  "upgrade",
  "team",
  "teams",
  "workspace",
  "workspaces",
  "organization",
  "org",
  "orgs",

  // marketing and legal
  "about",
  "blog",
  "careers",
  "contact",
  "docs",
  "documentation",
  "faq",
  "features",
  "help",
  "support",
  "home",
  "legal",
  "privacy",
  "terms",
  "tos",
  "security",
  "cookies",
  "press",
  "changelog",
  "developers",

  // framework, assets and well-known files
  "_next",
  "static",
  "assets",
  "public",
  "images",
  "img",
  "media",
  "files",
  "uploads",
  "cdn",
  "icon",
  "favicon",
  "robots",
  "sitemap",
  "manifest",
  "opengraph-image",
  "twitter-image",
  "apple-icon",
  "well-known",

  // generic words that would be misleading as a workspace URL
  "www",
  "mail",
  "email",
  "null",
  "undefined",
  "test",
  "demo",
  "example",
]);

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
  slug: z
    .string()
    .trim()
    .min(3, "URL must be at least 3 characters")
    .max(48, "URL must be at most 48 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens")
    .refine((slug) => !reservedSlugs.has(slug), "This URL is reserved"),
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
