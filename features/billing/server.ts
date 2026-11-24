import "server-only";

// Public, server-only API of the billing feature. Import from "@/features/billing/server" only.

/* ------------------------------ Entitlements ------------------------------ */
export { assertWithinLimit, requireEntitlement } from "./libs/entitlements";
export { getEntitlements } from "./libs/get-entitlements";

/* -------------------------------- Services -------------------------------- */
// for admin loaders and actions, which call requireAdmin() first
export { countPlans, createPlan, getPlan, getPlans, updatePlan } from "./services/plan";
export { countSubscriptions, getSubscription, getSubscriptions, updateSubscription, upsertSubscription } from "./services/subscription";
