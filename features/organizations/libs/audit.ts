import type { Prisma } from "@/generated/prisma/client";
import { PLATFORM_ACTOR_NAME, type AuditAction } from "@/features/organizations/libs/audit-actions";
import { cacheTags } from "@/lib/cache/cache-tags";
import type { Access } from "@/features/organizations/services/get-membership";
import { createAuditLog } from "@/features/organizations/services/audit-log";

/**
 * Records an access change made by `access`'s member. Call it after the change succeeded:
 * a failed entry is logged, not thrown, because the change itself has already been applied.
 */
export async function recordAudit(
  access: Pick<Access, "organization" | "session">,
  action: AuditAction,
  targetLabel: string,
  metadata?: Prisma.InputJsonObject,
) {
  await createAuditLog({
    data: {
      organization: { connect: { id: access.organization.id } },
      actor: { connect: { id: access.session.user.id } },
      actorName: access.session.user.name,
      action,
      targetLabel: targetLabel.slice(0, 255),
      metadata,
    },
    select: { id: true },
  }).catch((error) => console.error("Failed to record audit log entry", { action, error }));
}

export type PlatformAuditEntry = {
  organizationId: string;
  action: Extract<AuditAction, `organization.${"approve" | "reject" | "suspend" | "reactivate"}`>;
  /** the organization's name at the time */
  targetLabel: string;
  metadata?: Prisma.InputJsonObject;
};

/** Tags to bust once the transaction that wrote a platform audit entry has committed. */
export const PLATFORM_AUDIT_TAGS = [cacheTags.auditLogs, cacheTags.auditLogCount];

/**
 * Writes a platform team review to the organization's own audit log, inside `tx`, the transaction
 * that makes the change. Unlike `recordAudit`, errors are thrown so the change rolls back with it.
 * The actor is shown as "Platform team" with no user link; the admin's identity goes only to the
 * admin audit log (F2). After the commit, the caller busts `PLATFORM_AUDIT_TAGS`.
 */
export const writePlatformAudit = (tx: Prisma.TransactionClient, entry: PlatformAuditEntry) =>
  tx.auditLog.create({
    data: {
      organizationId: entry.organizationId,
      actorId: null,
      actorName: PLATFORM_ACTOR_NAME,
      action: entry.action,
      targetLabel: entry.targetLabel.slice(0, 255),
      metadata: entry.metadata,
    },
    select: { id: true },
  });
