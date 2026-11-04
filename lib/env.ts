import "dotenv/config";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z.url(),
    SESSION_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    // unset means "derive from BETTER_AUTH_URL"
    COOKIE_SECURE: z
      .enum(["0", "1", "true", "false"])
      .optional()
      .transform((value) => (value === undefined ? undefined : value === "1" || value === "true")),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z
      .enum(["0", "1", "true", "false"])
      .default("0")
      .transform((value) => value === "1" || value === "true"),
    SMTP_USER: z.string().optional(),
    SMTP_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    COOKIE_SECURE: process.env.COOKIE_SECURE,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
