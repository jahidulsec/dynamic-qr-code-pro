"use server";

import type { Prisma } from "@/generated/prisma/client";
import { ADMIN_ORGANIZATION_TABS } from "@/features/admin/constants";
import {
  adminOrganizationDetailSelect,
  adminOrganizationListSelect,
  buildAdminOrganizationWhere,
  describeAdminAuditMetadata,
  planState,
  TAB_STATUS,
} from "@/features/admin/libs/admin-organization-query";
import { organizationIdSchema } from "@/features/admin/schemas/review-organization";
import { getAdminAuditLogs } from "@/features/admin/services/admin-audit-log";
import { adminOrganizationsSearchParamsSchema, type AdminOrganizationTab } from "@/features/admin/schemas/admin-query-schema";
import { requireAdmin } from "@/features/admin/services/admin-session";
import { countOrganizations, getOrganization, getOrganizations } from "@/features/admin/services/organization";
import { countQrCodes } from "@/features/admin/services/qr-code";
import { countQrScans } from "@/features/admin/services/qr-scan";
import { getEntitlements, getPlans } from "@/features/billing/server";
import { isOwnerRole, parseRoles } from "@/features/organizations/server";
import type { SearchParams } from "@/types/params";
import { apiResponse } from "@/utils/response";

/** Pending requests for the sidebar badge; read fresh so it never lags behind an approval. */
export const getPendingOrganizationCount = async () => {
  try {
    await requireAdmin();
    const data = await countOrganizations({ where: { status: "PENDING" } }, { cache: false });
    return apiResponse.single({ data });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// the review queue: whoever asked first is reviewed first
const oldestFirst = [{ createdAt: "asc" }, { id: "asc" }] satisfies Prisma.OrganizationOrderByWithRelationInput[];
const newestFirst = [{ createdAt: "desc" }, { id: "desc" }] satisfies Prisma.OrganizationOrderByWithRelationInput[];

/**
 * /admin/organizations, straight from its URL search params. Every read is fresh: this is the
 * review queue, and its counts must match the dashboard and sidebar right after an approval.
 */
export const getAdminOrganizations = async (searchParams: SearchParams) => {
  try {
    const query = adminOrganizationsSearchParamsSchema.parse(searchParams);
    await requireAdmin();

    const now = new Date();
    const filters = buildAdminOrganizationWhere(query, now);

    const [tabCounts, plans] = await Promise.all([
      Promise.all(
        ADMIN_ORGANIZATION_TABS.map((tab) =>
          countOrganizations({ where: { ...filters, status: TAB_STATUS[tab] } }, { cache: false }),
        ),
      ),
      getPlans(
        { select: { key: true, name: true, isDefault: true, archivedAt: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
        { cache: false },
      ),
    ]);
    const counts = Object.fromEntries(ADMIN_ORGANIZATION_TABS.map((tab, i) => [tab, tabCounts[i]])) as Record<
      AdminOrganizationTab,
      number
    >;

    // no tab in the URL: open the queue while there's anything in it
    const status: AdminOrganizationTab = query.status ?? (counts.pending > 0 ? "pending" : "all");

    const rows = await getOrganizations(
      {
        where: { ...filters, status: TAB_STATUS[status] },
        select: adminOrganizationListSelect,
        orderBy: status === "pending" ? oldestFirst : newestFirst,
        skip: (query.page - 1) * query.size,
        take: query.size,
      },
      { cache: false },
    );

    const items = rows.map(({ members, subscription, _count, ...organization }) => {
      const owner = members.find((member) => isOwnerRole(member.role))?.user ?? null;
      return {
        ...organization,
        owner,
        plan: subscription ? { key: subscription.plan.key, name: subscription.plan.name } : null,
        planState: planState(subscription, now),
        qrCodeCount: _count.qrCodes,
        memberCount: _count.members,
      };
    });

    const defaultPlan = plans.find((plan) => plan.isDefault) ?? null;

    return apiResponse.single({
      data: {
        items,
        count: counts[status],
        counts,
        query: { ...query, status },
        // archived plans still have organizations on them, so they stay filterable
        plans: plans.map((plan) => ({ key: plan.key, name: plan.archivedAt ? `${plan.name} (archived)` : plan.name })),
        defaultPlanName: defaultPlan?.name ?? null,
      },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// scans compared with the plan are a 30-day window (spec 04, usage section)
const SCAN_WINDOW_DAYS = 30;
// the detail page shows recent history; the full log is /admin/audit-log
const HISTORY_LIMIT = 50;

/**
 * /admin/organizations/[id]: the organization, its members, usage, subscription and admin history.
 * Every read is fresh, because the page is where an admin reviews and changes it. `data` is null for an
 * unknown id, so the page can 404.
 */
export const getAdminOrganization = async (organizationId: string) => {
  try {
    await requireAdmin();
    // an id that can't exist reads as "not found", like an unknown one
    const parsed = organizationIdSchema.safeParse(organizationId);
    if (!parsed.success) return apiResponse.single({ data: null });
    const id = parsed.data;

    const now = new Date();
    const organization = await getOrganization(
      { where: { id }, select: adminOrganizationDetailSelect(now) },
      { cache: false },
    );
    if (!organization) return apiResponse.single({ data: null });

    const scansSince = new Date(now.getTime() - SCAN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const [entitlements, trashedQrCodes, scans, plans, history] = await Promise.all([
      getEntitlements(id),
      countQrCodes({ where: { organizationId: id, deletedAt: { not: null } } }, { cache: false }),
      countQrScans({ where: { qrCode: { organizationId: id }, scannedAt: { gte: scansSince } } }, { cache: false }),
      // archived plans can't be newly assigned
      getPlans(
        {
          where: { archivedAt: null },
          select: { id: true, name: true, isDefault: true },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
        { cache: false },
      ),
      getAdminAuditLogs(
        {
          where: { targetId: id, targetType: { in: ["organization", "subscription"] } },
          select: { id: true, actorName: true, action: true, targetLabel: true, metadata: true, createdAt: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: HISTORY_LIMIT,
        },
        { cache: false },
      ),
    ]);

    const { members, _count, ...rest } = organization;

    return apiResponse.single({
      data: {
        organization: rest,
        members: members.map((member) => ({
          id: member.id,
          name: member.user.name,
          email: member.user.email,
          roles: parseRoles(member.role),
          isOwner: isOwnerRole(member.role),
          joinedAt: member.createdAt,
        })),
        entitlements,
        usage: {
          qrCodes: _count.qrCodes,
          trashedQrCodes,
          members: members.length,
          pendingInvitations: _count.invitations,
          customRoles: _count.roles,
          scans,
        },
        plans: plans.map((plan) => ({ id: plan.id, name: plan.name, isDefault: plan.isDefault })),
        history: history.map((entry) => ({
          id: entry.id,
          actorName: entry.actorName,
          action: entry.action,
          targetLabel: entry.targetLabel,
          detail: describeAdminAuditMetadata(entry.metadata),
          createdAt: entry.createdAt,
        })),
      },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
