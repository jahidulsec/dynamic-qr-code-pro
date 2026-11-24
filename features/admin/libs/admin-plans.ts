"use server";

import type { Prisma } from "@/generated/prisma/client";
import { planIdSchema } from "@/features/admin/schemas/manage-plans";
import { requireAdmin } from "@/features/admin/services/admin-session";
import { getPlan, getPlans } from "@/features/billing/server";
import { normalizePlanFeatures } from "@/features/billing";
import { apiResponse } from "@/utils/response";

const adminPlanSelect = {
  id: true,
  key: true,
  name: true,
  description: true,
  priceMonthly: true,
  priceYearly: true,
  currency: true,
  maxQrCodes: true,
  maxMembers: true,
  maxCustomRoles: true,
  features: true,
  isDefault: true,
  isPublic: true,
  sortOrder: true,
  archivedAt: true,
  // every subscription row on the plan; these are what keep it from being deleted
  _count: { select: { subscriptions: true } },
} satisfies Prisma.PlanSelect;

type AdminPlanRow = Prisma.PlanGetPayload<{ select: typeof adminPlanSelect }>;

const toAdminPlan = ({ _count, features, ...plan }: AdminPlanRow) => ({
  ...plan,
  features: normalizePlanFeatures(features),
  organizationCount: _count.subscriptions,
});

/** /admin/plans: every plan in sortOrder, archived ones included. Fresh, since this is where they're edited. */
export const getAdminPlans = async () => {
  try {
    await requireAdmin();
    const plans = await getPlans(
      { select: adminPlanSelect, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
      { cache: false },
    );
    return apiResponse.single({ data: plans.map(toAdminPlan) });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

/** /admin/plans/[id]: `data` is null for an unknown id, so the page can 404. */
export const getAdminPlan = async (planId: string) => {
  try {
    await requireAdmin();
    const parsed = planIdSchema.safeParse(planId);
    if (!parsed.success) return apiResponse.single({ data: null });

    const plan = await getPlan({ where: { id: parsed.data }, select: adminPlanSelect }, { cache: false });
    return apiResponse.single({ data: plan ? toAdminPlan(plan) : null });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
