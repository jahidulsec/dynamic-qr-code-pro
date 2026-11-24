import "server-only";

import { cache } from "react";

import { resolveEntitlements, type Entitlements } from "@/features/billing/libs/entitlements";
import { getPlan } from "@/features/billing/services/plan";
import { getSubscription } from "@/features/billing/services/subscription";

const planSelect = {
  id: true,
  key: true,
  name: true,
  maxQrCodes: true,
  maxMembers: true,
  maxCustomRoles: true,
  features: true,
} as const;

/**
 * The plan in effect for an organization. Reads fresh ({ cache: false }): limits and feature
 * gates are security-sensitive. Shared per request through React `cache()`, so a page and the
 * loaders it renders do one lookup.
 *
 * Callers must have authorized access to `organizationId` already (requireOrganization /
 * requireAdmin).
 */
export const getEntitlements = cache(async (organizationId: string): Promise<Entitlements> => {
  const [subscription, defaultPlan] = await Promise.all([
    getSubscription(
      {
        where: { organizationId },
        select: { status: true, currentPeriodEnd: true, plan: { select: planSelect } },
      },
      { cache: false },
    ),
    getPlan({ where: { isDefault: true }, select: planSelect }, { cache: false }),
  ]);

  // the migration seeds one and setDefaultPlanAction always keeps exactly one
  if (!defaultPlan) throw new Error("No default plan is configured");

  return resolveEntitlements(subscription, defaultPlan);
});
