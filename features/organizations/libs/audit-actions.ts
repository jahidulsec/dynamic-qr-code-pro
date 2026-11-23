// Client-safe: what the audit log records, and how the Audit log page phrases it.
export const AUDIT_ACTIONS = {
  "role.create": "created the role",
  "role.update": "edited the role",
  "role.delete": "deleted the role",
  "member.role.update": "changed the role of",
  "member.remove": "removed",
  "invitation.create": "invited",
  "invitation.resend": "resent the invitation for",
  "invitation.cancel": "canceled the invitation for",
  "organization.update": "updated the organization",
  // written by the platform team's reviews; the actor is shown as PLATFORM_ACTOR_NAME
  "organization.approve": "approved the organization",
  "organization.reject": "didn't approve the organization",
  "organization.suspend": "suspended the organization",
  "organization.reactivate": "reactivated the organization",
} as const;

/** How platform admins appear in an organization's audit log; their names stay in the admin log (F2). */
export const PLATFORM_ACTOR_NAME = "Platform team";

export type AuditAction = keyof typeof AUDIT_ACTIONS;

export type AuditLogRow = {
  id: string;
  actorName: string;
  action: AuditAction;
  targetLabel: string;
  /** a short "from → to" or role summary, when the entry has one */
  detail: string | null;
  createdAt: string;
};
