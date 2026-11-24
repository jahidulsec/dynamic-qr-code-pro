import type { OrganizationStatus, Prisma, SubscriptionStatus } from "@/generated/prisma/client";
import { ADMIN_EXPIRING_DAYS } from "@/features/admin/constants";
import type { AdminOrganizationTab } from "@/features/admin/schemas/admin-query-schema";

export type AdminOrganizationFilters = {
  search?: string;
  plan?: string;
  expiring?: boolean;
};

export const TAB_STATUS = {
  pending: "PENDING",
  active: "ACTIVE",
  suspended: "SUSPENDED",
  rejected: "REJECTED",
  all: undefined,
} as const satisfies Record<AdminOrganizationTab, OrganizationStatus | undefined>;

/** Filters shared by the list and every tab count; the status comes on top. */
export function buildAdminOrganizationWhere(
  { search, plan, expiring }: AdminOrganizationFilters,
  now = new Date(),
): Prisma.OrganizationWhereInput {
  const term = search?.trim();
  const until = new Date(now.getTime() + ADMIN_EXPIRING_DAYS * 24 * 60 * 60 * 1000);

  // both conditions apply to the one subscription row
  const subscription: Prisma.SubscriptionWhereInput = {
    ...(plan ? { plan: { key: plan } } : {}),
    // F11: only subscriptions still in effect, with an end date inside the window
    ...(expiring ? { status: { in: ["TRIALING", "ACTIVE"] }, currentPeriodEnd: { gte: now, lte: until } } : {}),
  };

  return {
    ...(term ? { OR: [{ name: { contains: term } }, { slug: { contains: term } }] } : {}),
    ...(plan || expiring ? { subscription: { is: subscription } } : {}),
  };
}

// "owner" can sit in a comma-separated role list, and `contains` also matches e.g. "co-owner":
// the exact match is checked after the read
const OWNER_CANDIDATES = 5;

export const adminOrganizationListSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  createdAt: true,
  members: {
    where: { role: { contains: "owner" } },
    orderBy: { createdAt: "asc" },
    take: OWNER_CANDIDATES,
    select: { role: true, user: { select: { name: true, email: true } } },
  },
  subscription: {
    select: { status: true, currentPeriodEnd: true, plan: { select: { key: true, name: true } } },
  },
  _count: { select: { members: true, qrCodes: { where: { deletedAt: null } } } },
} satisfies Prisma.OrganizationSelect;

export type AdminOrganizationRow = Prisma.OrganizationGetPayload<{ select: typeof adminOrganizationListSelect }>;

export type PlanState = "active" | "trialing" | "expired" | "canceled" | "none";

/** Spec 03's state table. T-18's resolveEntitlements is the shared version once billing exists. */
export function planState(
  subscription: { status: SubscriptionStatus; currentPeriodEnd: Date | null } | null,
  now = new Date(),
): PlanState {
  if (!subscription) return "none";
  if (subscription.status === "CANCELED") return "canceled";
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd <= now) return "expired";
  return subscription.status === "TRIALING" ? "trialing" : "active";
}

/** Everything the detail page shows about one organization, except the counts that need their own query. */
export const adminOrganizationDetailSelect = (now: Date) =>
  ({
    id: true,
    name: true,
    slug: true,
    status: true,
    statusReason: true,
    reviewedAt: true,
    createdAt: true,
    reviewedBy: { select: { name: true, email: true } },
    members: {
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, createdAt: true, user: { select: { name: true, email: true } } },
    },
    subscription: {
      select: {
        status: true,
        interval: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        canceledAt: true,
        provider: true,
        notes: true,
        plan: { select: { id: true, name: true, archivedAt: true } },
      },
    },
    _count: {
      select: {
        qrCodes: { where: { deletedAt: null } },
        roles: true,
        // counted the way the member limit counts them
        invitations: { where: { status: "pending", expiresAt: { gt: now } } },
      },
    },
  }) satisfies Prisma.OrganizationSelect;
