/**
 * Central registry of cache tags used with `cacheTag` (via `cachedRead`)
 * and `updateTag` (via `mutate`).
 *
 * Every cached service read should tag its entry from here so the matching
 * mutation can bust it by the same key.
 */
export const cacheTags = {
  users: "users",
  userCount: "users-count",
  organizations: "organizations",
  organizationCount: "organizations-count",
  members: "members",
  memberCount: "members-count",
  invitations: "invitations",
  invitationCount: "invitations-count",
  organizationRoles: "organization-roles",
  auditLogs: "audit-logs",
  auditLogCount: "audit-logs-count",
  qrCodes: "qr-codes",
  qrCodeCount: "qr-codes-count",
  qrTags: "qr-tags",
  qrTagCount: "qr-tags-count",
  qrScans: "qr-scans",
  qrScanCount: "qr-scans-count",
} as const;

export type CacheTag = (typeof cacheTags)[keyof typeof cacheTags];

/** Per-organization tag, so a write only busts that organization's reads. */
export const organizationTag = (organizationId: string) =>
  `organization:${organizationId}`;

/** Per-QR-code tag, so editing one code only busts its own detail/analytics reads. */
export const qrCodeTag = (qrCodeId: number) => `qr-code:${qrCodeId}`;
