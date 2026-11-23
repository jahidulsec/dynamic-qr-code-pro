// Client-safe: what the admin audit log records, and how the admin Audit log page phrases it.
export const ADMIN_AUDIT_ACTIONS = {
  "organization.approve": "approved the organization",
  "organization.reject": "rejected the organization",
  "organization.suspend": "suspended the organization",
  "organization.reactivate": "reactivated the organization",
  "subscription.set": "set the subscription of",
  "subscription.extend": "extended the subscription of",
  "subscription.cancel": "canceled the subscription of",
  "plan.create": "created the plan",
  "plan.update": "edited the plan",
  "plan.archive": "archived the plan",
  "plan.unarchive": "unarchived the plan",
  "plan.default": "made the default plan",
  "user.ban": "banned",
  "user.unban": "unbanned",
  "user.sessions.revoke": "signed out every session of",
} as const;

export type AdminAuditAction = keyof typeof ADMIN_AUDIT_ACTIONS;

export const ADMIN_AUDIT_TARGET_TYPES = ["organization", "subscription", "plan", "user"] as const;

export type AdminAuditTargetType = (typeof ADMIN_AUDIT_TARGET_TYPES)[number];
