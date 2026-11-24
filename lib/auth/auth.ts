import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, organization } from "better-auth/plugins";
import prisma from "@/config/db";
import {
  invitationEmail,
  organizationRequestEmail,
  passwordChangedEmail,
  resetPasswordLinkEmail,
  sendEmail,
  verificationLinkEmail,
  welcomeEmail,
} from "@/features/email/server";
import { getEntitlements } from "@/features/billing/server";
import { createOrganizationSchema } from "@/features/organizations";
import { adminAc, adminRoles, SUPERADMIN_ROLE } from "@/lib/auth/admin-permissions";
import { ac, isSystemRole, roles, SYSTEM_ROLE_DETAILS } from "@/lib/auth/permissions";
import { env } from "@/lib/env";

// keep in sync with the expiry stated in the invite dialog
const INVITATION_EXPIRES_IN_HOURS = 48;

// keep in sync with the limit stated on the Roles page
export const MAX_CUSTOM_ROLES = 20;

// requests waiting for review that one user may own at a time; better-auth's organizationLimit counts every membership
const MAX_PENDING_ORGANIZATIONS = 2;

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

      // the admin plugin's endpoints would skip our admin audit log; only `auth.api` calls from admin actions may use them
      if (ctx.request && ctx.path.startsWith("/admin/"))
        throw new APIError("FORBIDDEN", { message: "Admin endpoints are not available over HTTP" });
    }),
  },
  advanced: {
    // secure by default whenever the app is served over HTTPS
    useSecureCookies: env.COOKIE_SECURE ?? env.BETTER_AUTH_URL.startsWith("https://"),
  },
  // must be the last plugin so cookies set in server actions are applied
  plugins: [
    // platform admins; separate from organization roles, see admin-permissions.ts
    admin({ ac: adminAc, roles: adminRoles, defaultRole: "user", adminRoles: [SUPERADMIN_ROLE] }),
    organization({
      // the permission catalogue and system roles; custom roles are stored per organization
      ac,
      roles,
      dynamicAccessControl: { enabled: true, maximumRolesPerOrganization: MAX_CUSTOM_ROLES },
      schema: {
        organization: {
          // review state; only admin actions change it, through Prisma, so clients can never set it
          additionalFields: {
            status: { type: "string", required: true, defaultValue: "PENDING", input: false },
            statusReason: { type: "string", required: false, input: false },
          },
        },
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
        beforeCreateOrganization: async ({ organization, user }) => {
          const data = parseOrganization(organization);
          if ((await countPendingOwnedOrganizations(user.id)) >= MAX_PENDING_ORGANIZATIONS)
            throw new APIError("FORBIDDEN", { message: "You already have organizations waiting for review." });
          return { data };
        },
        // a failed notice must not fail the create, which has already been saved
        afterCreateOrganization: async ({ organization, user }) => notifyAdminsOfRequest(organization, user),
        beforeUpdateOrganization: async ({ organization }) => ({ data: parseOrganization(organization, true) }),
        // invite is server-action-only and the action already refuses these organizations; this is defense in depth
        beforeCreateInvitation: async ({ organization }) => {
          if (organization.status !== "ACTIVE")
            throw new APIError("FORBIDDEN", { message: "This organization isn't active" });
        },
        // accept can be called over HTTP, and invitations sent before a suspension are still pending
        beforeAcceptInvitation: async ({ organization }) => {
          if (organization.status !== "ACTIVE")
            throw new APIError("FORBIDDEN", { message: "This organization isn't accepting new members right now" });

          // F3: invitations sent before a downgrade or expiry must not push the organization past its member limit
          const { limits } = await getEntitlements(organization.id);
          if (limits.members !== null && (await prisma.member.count({ where: { organizationId: organization.id } })) >= limits.members)
            throw new APIError("FORBIDDEN", {
              message: "This organization has reached its plan's member limit. Ask an owner to upgrade or free up a seat.",
            });
        },
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

// organizations still waiting for review that the user owns
async function countPendingOwnedOrganizations(userId: string) {
  const memberships = await prisma.member.findMany({
    where: { userId, role: { contains: "owner" }, organization: { status: "PENDING" } },
    select: { role: true },
  });
  // roles are a comma-separated list of keys; `contains` alone would also match e.g. "co-owner"
  return memberships.filter(({ role }) => role.split(",").some((key) => key.trim() === "owner")).length;
}

async function notifyAdminsOfRequest(
  organization: { id: string; name: string; slug: string },
  user: { name: string; email: string },
) {
  const email = organizationRequestEmail({
    organizationId: organization.id,
    organizationName: organization.name,
    organizationSlug: organization.slug,
    requesterName: user.name,
    requesterEmail: user.email,
  });

  // one message per address so admins don't see each other's addresses, and one bad address doesn't stop the rest
  const results = await Promise.allSettled(env.ADMIN_NOTIFY_EMAILS.map((to) => sendEmail({ ...email, to })));
  for (const result of results)
    if (result.status === "rejected") console.error("Failed to send organization request email", result.reason);
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
