// feature flags a plan can switch on; stored as JSON on `plan.features`, unknown keys are dropped on save
export const PLAN_FEATURES = ["reports", "auditLog", "csvExport"] as const;

export type PlanFeature = (typeof PLAN_FEATURES)[number];

export const PLAN_FEATURE_LABELS: Record<PlanFeature, string> = {
  reports: "Reports and QR analytics",
  auditLog: "Audit log",
  csvExport: "CSV export",
};

// shown when a gated page, loader or action is refused
export const PLAN_FEATURE_DENIED_MESSAGES: Record<PlanFeature, string> = {
  reports: "Reports aren't included in your plan.",
  auditLog: "The audit log isn't included in your plan.",
  csvExport: "CSV export isn't included in your plan.",
};

// countable limits; null on the plan means unlimited
export const PLAN_LIMITS = ["qrCodes", "members", "customRoles"] as const;

export type PlanLimit = (typeof PLAN_LIMITS)[number];

export const PLAN_LIMIT_LABELS: Record<PlanLimit, string> = {
  qrCodes: "QR codes",
  members: "Members",
  customRoles: "Custom roles",
};

// stable, lowercase, never renamed
export const PLAN_KEY_PATTERN = /^[a-z][a-z0-9-]{1,31}$/;

export const ENTITLEMENT_STATES = ["trialing", "active", "expired", "canceled", "none"] as const;

export type EntitlementState = (typeof ENTITLEMENT_STATES)[number];

export const ENTITLEMENT_STATE_LABELS: Record<EntitlementState, string> = {
  trialing: "Trial",
  active: "Active",
  expired: "Expired",
  canceled: "Canceled",
  none: "Default",
};

// statuses an admin can set directly; CANCELED only comes from cancelSubscriptionAction
export const SUBSCRIPTION_FORM_STATUSES = ["TRIALING", "ACTIVE"] as const;

export const BILLING_INTERVALS = ["MONTH", "YEAR", "NONE"] as const;
