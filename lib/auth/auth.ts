import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import prisma from "@/config/db";
import {
  invitationEmail,
  passwordChangedEmail,
  resetPasswordLinkEmail,
  sendEmail,
  verificationLinkEmail,
  welcomeEmail,
} from "@/features/email/server";
import { createOrganizationSchema } from "@/features/organizations";
import { ac, isSystemRole, roles, SYSTEM_ROLE_DETAILS } from "@/lib/auth/permissions";
import { env } from "@/lib/env";

// keep in sync with the expiry stated in the invite dialog
const INVITATION_EXPIRES_IN_HOURS = 48;

// keep in sync with the limit stated on the Roles page
export const MAX_CUSTOM_ROLES = 20;

/**
 * Endpoints that change who can do what. Over HTTP they'd skip the checks and audit entries in our
 * server actions (e.g. better-auth lets an admin change their own role), so only `auth.api` calls
 * made by those actions on the server may reach them.
 */
const SERVER_ACTION_ONLY_PATHS = new Set([
  "/organization/update",
  "/organization/delete",
  "/organization/invite-member",
  "/organization/cancel-invitation",
  "/organization/update-member-role",
  "/organization/remove-member",
  "/organization/create-role",
  "/organization/update-role",
  "/organization/delete-role",
]);

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.SESSION_SECRET,
  database: prismaAdapter(prisma, { provider: "mysql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    // keep in sync with the expiry stated in resetPasswordLinkEmail
    resetPasswordTokenExpiresIn: 60 * 60,
    // whoever knew the old password loses access
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      await sendEmail({ to: user.email, ...resetPasswordLinkEmail(url) });
    },
    async onPasswordReset({ user }) {
      // opening the emailed link proves ownership, so unverified users can sign in straight away
      if (!user.emailVerified) await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });

      // a failed notice must not fail the reset, which has already been applied
      await sendEmail({ to: user.email, ...passwordChangedEmail(user.name) }).catch((error) =>
        console.error("Failed to send password changed email", error),
      );
    },
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
  hooks: {
    // `request` is only set for HTTP calls; server-side `auth.api` calls have none
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.request && SERVER_ACTION_ONLY_PATHS.has(ctx.path))
        throw new APIError("FORBIDDEN", { message: "Use the organization settings to make this change" });
    }),
  },
  advanced: {
    // secure by default whenever the app is served over HTTPS
    useSecureCookies: env.COOKIE_SECURE ?? env.BETTER_AUTH_URL.startsWith("https://"),
  },
  // must be the last plugin so cookies set in server actions are applied
  plugins: [
    organization({
      // the permission catalogue and system roles; custom roles are stored per organization
      ac,
      roles,
      dynamicAccessControl: { enabled: true, maximumRolesPerOrganization: MAX_CUSTOM_ROLES },
      schema: {
        organizationRole: {
          additionalFields: {
            label: { type: "string", required: true },
            description: { type: "string", required: false },
          },
        },
      },
      invitationExpiresIn: INVITATION_EXPIRES_IN_HOURS * 60 * 60,
      // re-inviting an email replaces its pending invitation instead of failing
      cancelPendingInvitationsOnReInvite: true,
      async sendInvitationEmail({ id, email, role, organization, inviter }) {
        await sendEmail({
          to: email,
          ...invitationEmail({
            url: new URL(`/accept-invitation/${id}`, env.BETTER_AUTH_URL).toString(),
            organizationName: organization.name,
            inviterName: inviter.user.name,
            role: await invitationRoleLabel(organization.id, role),
            expiresInHours: INVITATION_EXPIRES_IN_HOURS,
          }),
        });
      },
      // the client can call these endpoints directly, so the server action's validation isn't enough
      organizationHooks: {
        beforeCreateOrganization: async ({ organization }) => ({ data: parseOrganization(organization) }),
        beforeUpdateOrganization: async ({ organization }) => ({ data: parseOrganization(organization, true) }),
      },
    }),
    nextCookies(),
  ],
});

// the invitation stores role keys; the email names them the way the settings pages do
async function invitationRoleLabel(organizationId: string, role: string) {
  const keys = role.split(",").map((key) => key.trim()).filter(Boolean);
  const custom = await prisma.organizationRole.findMany({
    where: { organizationId, role: { in: keys.filter((key) => !isSystemRole(key)) } },
    select: { role: true, label: true },
  });
  const labels = keys.map((key) =>
    isSystemRole(key) ? SYSTEM_ROLE_DETAILS[key].label : (custom.find((r) => r.role === key)?.label ?? key),
  );
  return labels.join(", ").toLowerCase();
}

function parseOrganization(organization: { name?: string; slug?: string; logo?: string | null }, partial = false) {
  // there's no logo upload yet; allow only our own upload host once there is
  if (organization.logo) throw new APIError("BAD_REQUEST", { message: "Custom logos aren't supported yet" });

  const schema = partial ? createOrganizationSchema.partial() : createOrganizationSchema;
  const result = schema.safeParse(organization);
  if (!result.success) throw new APIError("BAD_REQUEST", { message: result.error.issues[0].message });

  return result.data;
}

export type Session = typeof auth.$Infer.Session;
export type Organization = typeof auth.$Infer.Organization;
export type Member = typeof auth.$Infer.Member;
export type Invitation = typeof auth.$Infer.Invitation;
