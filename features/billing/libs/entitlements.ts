import { APIError } from "better-auth/api";

import {
  PLAN_FEATURE_DENIED_MESSAGES,
  type EntitlementState,
  type PlanFeature,
  type PlanLimit,
} from "@/features/billing/constants";
import { normalizePlanFeatures, type PlanFeatures } from "@/features/billing/schemas/plan-schema";

/**
 * Effective-plan resolution (spec 03, "Effective plan"). Pure: no Prisma, no request data, so it
 * can run anywhere and be tested on its own. The loader lives in `get-entitlements.ts`.
 */

export type EntitlementPlan = {
  id: string;
  key: string;
  name: string;
  maxQrCodes: number | null;
  maxMembers: number | null;
  maxCustomRoles: number | null;
  features: unknown;
};

export type EntitlementSubscription = {
  status: "TRIALING" | "ACTIVE" | "CANCELED";
  currentPeriodEnd: Date | null;
  plan: EntitlementPlan;
};

export type Entitlements = {
  plan: { id: string; key: string; name: string };
  /** the plan on the subscription row whatever its state, e.g. the plan that ended; null when there's none */
  subscriptionPlan: { id: string; key: string; name: string } | null;
  state: EntitlementState;
  /** the subscription's period end, also when it has expired or been canceled; null when there's none */
  currentPeriodEnd: Date | null;
  /** null = unlimited */
  limits: Record<PlanLimit, number | null>;
  features: PlanFeatures;
};

const deriveState = (subscription: EntitlementSubscription | null, now: Date): EntitlementState => {
  if (!subscription) return "none";
  if (subscription.status === "CANCELED") return "canceled";
  const end = subscription.currentPeriodEnd;
  if (end && new Date(end).getTime() <= now.getTime()) return "expired";
  return subscription.status === "TRIALING" ? "trialing" : "active";
};

/**
 * | Subscription                                   | state                 | Plan used           |
 * | none                                           | none                  | default plan        |
 * | TRIALING/ACTIVE, period end null or in future  | trialing / active     | subscription's plan |
 * | TRIALING/ACTIVE, period end in the past        | expired               | default plan        |
 * | CANCELED                                       | canceled              | default plan        |
 */
export const resolveEntitlements = (
  subscription: EntitlementSubscription | null,
  defaultPlan: EntitlementPlan,
  now: Date = new Date(),
): Entitlements => {
  const state = deriveState(subscription, now);
  const plan = (state === "trialing" || state === "active") && subscription ? subscription.plan : defaultPlan;

  return {
    plan: { id: plan.id, key: plan.key, name: plan.name },
    subscriptionPlan: subscription
      ? { id: subscription.plan.id, key: subscription.plan.key, name: subscription.plan.name }
      : null,
    state,
    currentPeriodEnd: subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd) : null,
    limits: { qrCodes: plan.maxQrCodes, members: plan.maxMembers, customRoles: plan.maxCustomRoles },
    features: normalizePlanFeatures(plan.features),
  };
};

/* ---------------------------------- Guards --------------------------------- */

const DEFAULT_LIMIT_MESSAGES: Record<PlanLimit, (limit: number) => string> = {
  qrCodes: (n) => `You've reached your plan's limit of ${n} QR codes. Empty the trash or upgrade to add more.`,
  members: (n) => `Your plan allows ${n} members, including pending invitations.`,
  customRoles: (n) => (n === 0 ? "Custom roles aren't included in your plan." : `Your plan allows ${n} custom roles.`),
};

/** Throws FORBIDDEN when the plan in effect doesn't include `feature`. */
export const requireEntitlement = (access: Entitlements, feature: PlanFeature) => {
  if (!access.features[feature]) {
    throw new APIError("FORBIDDEN", { message: PLAN_FEATURE_DENIED_MESSAGES[feature] });
  }
};

/**
 * Throws FORBIDDEN when adding `adding` items to `used` would go past the plan's limit (null =
 * unlimited). Being over the limit already (after a downgrade) only blocks adding more.
 * `message` overrides the default refusal, e.g. for restoring from trash.
 */
export const assertWithinLimit = (
  access: Entitlements,
  limit: PlanLimit,
  used: number,
  adding = 1,
  options?: { message?: (limit: number) => string },
) => {
  const max = access.limits[limit];
  if (max === null || used + adding <= max) return;
  const message = options?.message ?? DEFAULT_LIMIT_MESSAGES[limit];
  throw new APIError("FORBIDDEN", { message: message(max) });
};
