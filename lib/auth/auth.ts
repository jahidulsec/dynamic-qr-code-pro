import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import prisma from "@/config/db";
import { env } from "@/lib/env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.SESSION_SECRET,
  database: prismaAdapter(prisma, { provider: "mysql" }),
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    useSecureCookies: env.COOKIE_SECURE,
  },
  // must be the last plugin so cookies set in server actions are applied
  plugins: [organization(), nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
export type Organization = typeof auth.$Infer.Organization;
export type Member = typeof auth.$Infer.Member;
export type Invitation = typeof auth.$Infer.Invitation;
