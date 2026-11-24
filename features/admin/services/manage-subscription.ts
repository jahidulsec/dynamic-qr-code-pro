import { APIError } from "better-auth/api";

import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import { ADMIN_AUDIT_TAGS, writeAdminAudit } from "@/features/admin/libs/admin-audit";
import type { SubscriptionFormValues } from "@/features/billing";
import { mutate } from "@/lib/cache/shared";
import { cacheTags, organizationTag } from "@/lib/cache/cache-tags";

// not organization-scoped: only reachable through actions that call requireAdmin()

type Admin = { id: string; name: string };

const subscriptionSnapshotSelect = {
  planId: true,
  status: true,
  interval: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  canceledAt: true,
  notes: true,
  plan: { select: { name: true } },
} satisfies Prisma.SubscriptionSelect;

type SubscriptionSnapshot = Prisma.SubscriptionGetPayload<{ select: typeof subscriptionSnapshotSelect }>;

const iso = (date: Date | null) => (date ? date.toISOString() : null);

/** The audit log's before/after picture of a subscription row (dates as ISO strings). */
const snapshot = (row: SubscriptionSnapshot): Prisma.InputJsonObject => ({
  plan: row.plan.name,
  planId: row.planId,
  status: row.status,
  interval: row.interval,
  currentPeriodStart: iso(row.currentPeriodStart),
  currentPeriodEnd: iso(row.currentPeriodEnd),
  canceledAt: iso(row.canceledAt),
  notes: row.notes,
});

const writeTags = (organizationId: string) => [
  cacheTags.subscriptions,
  cacheTags.subscriptionCount,
  // the organizations list shows each one's plan and state
  cacheTags.organizations,
  organizationTag(organizationId),
  ...ADMIN_AUDIT_TAGS,
];

const findOrganization = async (tx: Prisma.TransactionClient, organizationId: string) => {
  const organization = await tx.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, slug: true, status: true },
  });
  if (!organization) throw new APIError("NOT_FOUND", { message: "Organization not found" });
  return organization;
};

const findSubscription = async (tx: Prisma.TransactionClient, organizationId: string) => {
  const subscription = await tx.subscription.findUnique({ where: { organizationId }, select: subscriptionSnapshotSelect });
  if (!subscription)
    throw new APIError("BAD_REQUEST", { message: "This organization has no subscription. Use Change plan to set one." });
  return subscription;
};

/** "The subscription changed while you were looking at it": the conditional write matched nothing. */
const changedMeanwhile = () =>
  new APIError("CONFLICT", { message: "The subscription was changed by someone else. Reload and try again." });

/* ----------------------------------- Set ----------------------------------- */

export type SetSubscriptionResult = {
  organization: { id: string; name: string; slug: string };
  plan: { id: string; name: string };
  planChanged: boolean;
  currentPeriodEnd: Date | null;
};

/** Creates or replaces the organization's subscription row, with an admin audit entry, in one transaction. */
export const setSubscription = (organizationId: string, values: SubscriptionFormValues, admin: Admin) =>
  mutate(
    () =>
      prisma.$transaction(async (tx): Promise<SetSubscriptionResult> => {
        const organization = await findOrganization(tx, organizationId);
        // approving creates the first subscription; setting one before would make the approval fail
        if (organization.status === "PENDING" || organization.status === "REJECTED")
          throw new APIError("BAD_REQUEST", { message: "Approve the organization before changing its plan" });

        // archived plans can't be newly assigned
        const plan = await tx.plan.findFirst({
          where: { id: values.planId, archivedAt: null },
          select: { id: true, name: true },
        });
        if (!plan) throw new APIError("BAD_REQUEST", { message: "Choose a plan that isn't archived" });

        const before = await tx.subscription.findUnique({ where: { organizationId }, select: subscriptionSnapshotSelect });

        const data = {
          planId: plan.id,
          status: values.status,
          interval: values.interval,
          currentPeriodStart: values.currentPeriodStart,
          currentPeriodEnd: values.currentPeriodEnd,
          canceledAt: null,
          notes: values.notes,
        };
        const after = await tx.subscription.upsert({
          where: { organizationId },
          create: { organizationId, ...data },
          update: data,
          select: subscriptionSnapshotSelect,
        });

        await writeAdminAudit(tx, {
          actor: admin,
          action: "subscription.set",
          targetType: "subscription",
          // the organization's id, so the entry shows in its history
          targetId: organization.id,
          targetLabel: organization.name,
          metadata: { before: before ? snapshot(before) : null, after: snapshot(after) },
        });

        return {
          organization: { id: organization.id, name: organization.name, slug: organization.slug },
          plan,
          planChanged: before?.planId !== plan.id,
          currentPeriodEnd: after.currentPeriodEnd,
        };
      }),
    writeTags(organizationId),
  );

/* --------------------------------- Extend --------------------------------- */

export type ExtendBy = { by: "month" | "year" } | { until: Date };

/** `date` plus `months`, clamped to the month's last day (Jan 31 + 1 month = Feb 28/29). */
export const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
};

/**
 * Moves the period end forward from max(now, current end). An expired subscription gets its plan back
 * at once, since the state is worked out from the end date at read time.
 */
export const extendSubscription = (organizationId: string, extend: ExtendBy, admin: Admin) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const organization = await findOrganization(tx, organizationId);
        const before = await findSubscription(tx, organizationId);

        if (before.status === "CANCELED")
          throw new APIError("BAD_REQUEST", {
            message: "A canceled subscription can't be extended. Use Change plan to start a new one.",
          });
        if (!before.currentPeriodEnd)
          throw new APIError("BAD_REQUEST", { message: "This subscription has no end date, so there's nothing to extend" });

        const now = new Date();
        const from = before.currentPeriodEnd > now ? before.currentPeriodEnd : now;
        const until =
          "until" in extend ? extend.until : addMonths(from, extend.by === "year" ? 12 : 1);
        if (until <= from)
          throw new APIError("BAD_REQUEST", { message: "The new end must be later than the current one and today" });

        // conditional on the end date read above, so two admins extending at once can't both count from it
        const { count } = await tx.subscription.updateMany({
          where: { organizationId, status: before.status, currentPeriodEnd: before.currentPeriodEnd },
          data: { currentPeriodEnd: until },
        });
        if (!count) throw changedMeanwhile();

        await writeAdminAudit(tx, {
          actor: admin,
          action: "subscription.extend",
          targetType: "subscription",
          targetId: organization.id,
          targetLabel: organization.name,
          metadata: {
            plan: before.plan.name,
            from: before.currentPeriodEnd.toISOString(),
            to: until.toISOString(),
            ...("by" in extend ? { by: extend.by } : {}),
          },
        });

        return { organization: { id: organization.id, name: organization.name }, currentPeriodEnd: until };
      }),
    writeTags(organizationId),
  );

/* --------------------------------- Cancel --------------------------------- */

/** Status CANCELED and canceledAt now: the default plan applies straight away. */
export const cancelSubscription = (organizationId: string, reason: string | undefined, admin: Admin) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const organization = await findOrganization(tx, organizationId);
        const before = await findSubscription(tx, organizationId);
        if (before.status === "CANCELED")
          throw new APIError("CONFLICT", { message: "This subscription is already canceled" });

        const { count } = await tx.subscription.updateMany({
          where: { organizationId, status: before.status },
          data: { status: "CANCELED", canceledAt: new Date() },
        });
        if (!count) throw changedMeanwhile();

        await writeAdminAudit(tx, {
          actor: admin,
          action: "subscription.cancel",
          targetType: "subscription",
          targetId: organization.id,
          targetLabel: organization.name,
          metadata: { plan: before.plan.name, from: before.status, to: "CANCELED", ...(reason ? { reason } : {}) },
        });

        return { organization: { id: organization.id, name: organization.name } };
      }),
    writeTags(organizationId),
  );
