import type { Prisma } from "@/generated/prisma/client";
import type { AdminAuditAction, AdminAuditTargetType } from "@/features/admin/libs/admin-audit-actions";
import { cacheTags } from "@/lib/cache/cache-tags";

export type AdminAuditEntry = {
  actor: { id: string; name: string };
  action: AdminAuditAction;
  targetType: AdminAuditTargetType;
  targetId: string;
  /** the target's name at the time */
  targetLabel: string;
  metadata?: Prisma.InputJsonObject;
};

/** Tags to bust once the transaction that wrote an admin audit entry has committed. */
export const ADMIN_AUDIT_TAGS = [cacheTags.adminAuditLogs, cacheTags.adminAuditLogCount];

/**
 * Writes an admin audit entry inside `tx`, the transaction that makes the change it records, so the
 * entry and the change commit or roll back together. Errors are thrown, failing the change. After the
 * commit, the caller busts `ADMIN_AUDIT_TAGS`.
 */
export const writeAdminAudit = (tx: Prisma.TransactionClient, entry: AdminAuditEntry) =>
  tx.adminAuditLog.create({
    data: {
      actorId: entry.actor.id,
      actorName: entry.actor.name.slice(0, 255),
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      targetLabel: entry.targetLabel.slice(0, 255),
      metadata: entry.metadata,
    },
    select: { id: true },
  });
