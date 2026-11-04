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
    COOKIE_SECURE: z
      .enum(["0", "1", "true", "false"])
      .default("0")
      .transform((value) => value === "1" || value === "true"),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    COOKIE_SECURE: process.env.COOKIE_SECURE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
