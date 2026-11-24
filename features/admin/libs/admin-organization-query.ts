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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/;

const asRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

// ISO timestamps read as their date: the log is admin-facing, the full value stays in the metadata
const text = (value: unknown) =>
  typeof value === "string" ? (ISO_DATE.test(value) ? value.slice(0, 10) : value) : typeof value === "number" ? String(value) : null;

/**
 * One readable line per admin audit entry's metadata, e.g. "PENDING → ACTIVE · Plan: Pro" or, for a
 * subscription change, "Free → Pro · ACTIVE · Ends: 2026-12-24".
 */
export function describeAdminAuditMetadata(metadata: Prisma.JsonValue | null): string | null {
  const record = asRecord(metadata);
  if (!record) return null;
  const parts: string[] = [];
  const { from, to, plan, reason, before, after } = record;

  const next = asRecord(after);
  if (next) {
    const previous = asRecord(before);
    const planText = text(next.plan);
    if (previous && text(previous.plan) !== planText) parts.push(`${text(previous.plan)} → ${planText}`);
    else if (planText) parts.push(`Plan: ${planText}`);
    if (text(next.status)) parts.push(String(text(next.status)));
    // subscription snapshots only; plan snapshots have no period
    if ("currentPeriodEnd" in next)
      parts.push(text(next.currentPeriodEnd) ? `Ends: ${text(next.currentPeriodEnd)}` : "No end date");
  } else {
    if (text(from) && text(to)) parts.push(`${text(from)} → ${text(to)}`);
    if (text(plan)) parts.push(`Plan: ${text(plan)}`);
  }
  if (text(reason)) parts.push(`Reason: ${text(reason)}`);
  return parts.length ? parts.join(" · ") : null;
}
