import { APIError } from "better-auth/api";

import prisma from "@/config/db";
import { PLATFORM_AUDIT_TAGS, writePlatformAudit, type PlatformAuditEntry } from "@/features/organizations/server";
import type { OrganizationStatus, Prisma, SubscriptionStatus } from "@/generated/prisma/client";
import { ADMIN_AUDIT_TAGS, writeAdminAudit } from "@/features/admin/libs/admin-audit";
import { mutate } from "@/lib/cache/shared";
import { cacheTags, organizationTag } from "@/lib/cache/cache-tags";

// not organization-scoped: only reachable through actions that call requireAdmin()

type ReviewAction = PlatformAuditEntry["action"];

/** Spec 02's transition table: anything not listed here is refused by the conditional update. */
const TRANSITIONS = {
  "organization.approve": { from: ["PENDING", "REJECTED"], to: "ACTIVE" },
  "organization.reject": { from: ["PENDING"], to: "REJECTED" },
  "organization.suspend": { from: ["ACTIVE"], to: "SUSPENDED" },
  "organization.reactivate": { from: ["SUSPENDED"], to: "ACTIVE" },
} as const satisfies Record<ReviewAction, { from: OrganizationStatus[]; to: OrganizationStatus }>;

export type ReviewTransition = {
  organizationId: string;
  action: ReviewAction;
  admin: { id: string; name: string };
  /** reject / suspend; cleared by approve and reactivate */
  reason?: string;
  /** approve only: the subscription created in the same transaction */
  subscription?: { planId: string; status: SubscriptionStatus; currentPeriodEnd?: Date };
};

export type ReviewedOrganization = { id: string; name: string; slug: string; planName: string | null };

/**
 * Moves an organization along one transition, with its subscription (approve) and both audit
 * entries, in one transaction. Throws "already reviewed" if the organization isn't in a `from`
 * status any more, e.g. when another admin got there first; nothing is written then.
 */
export const reviewOrganization = ({ organizationId, action, admin, reason, subscription }: ReviewTransition) => {
  const { from, to } = TRANSITIONS[action];

  return mutate(
    () =>
      prisma.$transaction(async (tx): Promise<ReviewedOrganization> => {
        // conditional on one `from` status at a time, so the audit records the status actually left. The row lock
        // the update takes serializes concurrent reviews: the loser re-reads the new status and matches nothing
        let previous: OrganizationStatus | null = null;
        for (const status of from) {
          const { count } = await tx.organization.updateMany({
            where: { id: organizationId, status },
            data: { status: to, statusReason: reason ?? null, reviewedAt: new Date(), reviewedById: admin.id },
          });
          if (count) {
            previous = status;
            break;
          }
        }
        if (!previous) throw new APIError("CONFLICT", { message: "This organization was already reviewed" });

        const organization = await tx.organization.findUniqueOrThrow({
          where: { id: organizationId },
          select: { id: true, name: true, slug: true },
        });

        let planName: string | null = null;
        if (subscription) {
          // archived plans can't be newly assigned
          const plan = await tx.plan.findFirst({
            where: { id: subscription.planId, archivedAt: null },
            select: { id: true, name: true },
          });
          if (!plan) throw new APIError("BAD_REQUEST", { message: "Choose a plan that isn't archived" });
          planName = plan.name;

          await tx.subscription.create({
            data: {
              organizationId,
              planId: plan.id,
              status: subscription.status,
              interval: "NONE",
              currentPeriodStart: new Date(),
              currentPeriodEnd: subscription.currentPeriodEnd ?? null,
            },
            select: { id: true },
          });
        }

        const metadata: Prisma.InputJsonObject = {
          from: previous,
          to,
          ...(reason ? { reason } : {}),
          ...(planName ? { plan: planName } : {}),
        };

        await writeAdminAudit(tx, {
          actor: admin,
          action,
          targetType: "organization",
          targetId: organization.id,
          targetLabel: organization.name,
          metadata,
        });
        await writePlatformAudit(tx, { organizationId, action, targetLabel: organization.name, metadata });

        return { ...organization, planName };
      }),
    [
      cacheTags.organizations,
      cacheTags.organizationCount,
      organizationTag(organizationId),
      ...(subscription ? [cacheTags.subscriptions, cacheTags.subscriptionCount] : []),
      ...ADMIN_AUDIT_TAGS,
      ...PLATFORM_AUDIT_TAGS,
    ],
  );
};
