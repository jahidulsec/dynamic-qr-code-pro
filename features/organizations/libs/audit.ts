import type { Prisma } from "@/generated/prisma/client";
import type { AuditAction } from "@/features/organizations/libs/audit-actions";
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
