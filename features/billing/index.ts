// Public, client-safe API of the billing feature. Import from "@/features/billing" only.
// Entitlement loading, guards and services are server-only and live in "./server".

/* ------------------------------- Components ------------------------------- */
export { BillingOverview, type BillingUsage } from "./components/billing-overview";
export { PlanUpgradeNotice } from "./components/plan-upgrade-notice";
export { UsageBar } from "./components/usage-bar";

/* --------------------------- Schemas, constants, types --------------------------- */
export {
  BILLING_INTERVALS,
  ENTITLEMENT_STATES,
  ENTITLEMENT_STATE_LABELS,
  PLAN_FEATURES,
  PLAN_FEATURE_LABELS,
  PLAN_KEY_PATTERN,
  PLAN_LIMITS,
  PLAN_LIMIT_LABELS,
  SUBSCRIPTION_FORM_STATUSES,
  type EntitlementState,
  type PlanFeature,
  type PlanLimit,
} from "./constants";
export type { Entitlements } from "./libs/entitlements";
export {
  normalizePlanFeatures,
  planFormSchema,
  subscriptionFormSchema,
  type PlanFeatures,
  type PlanFormInput,
  type PlanFormValues,
  type SubscriptionFormInput,
  type SubscriptionFormValues,
} from "./schemas/plan-schema";
