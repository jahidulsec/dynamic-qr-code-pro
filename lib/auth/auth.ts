import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import prisma from "@/config/db";
import { sendEmail, verificationLinkEmail, welcomeEmail } from "@/features/email";
import { env } from "@/lib/env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.SESSION_SECRET,
  database: prismaAdapter(prisma, { provider: "mysql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    // keep in sync with the expiry stated in verificationLinkEmail
    expiresIn: 60 * 60,
    async sendVerificationEmail({ user, url }) {
      await sendEmail({ to: user.email, ...verificationLinkEmail(url) });
    },
    async afterEmailVerification(user) {
      // a failed welcome email must not block verification
      await sendEmail({ to: user.email, ...welcomeEmail(user.name) }).catch((error) =>
        console.error("Failed to send welcome email", error),
      );
    },
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
