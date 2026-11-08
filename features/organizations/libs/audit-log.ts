import { AUDIT_ACTIONS, type AuditAction, type AuditLogRow } from "@/features/organizations/libs/audit-actions";
import { countAuditLogs, getAuditLogs } from "@/features/organizations/services/audit-log";
import { requirePermission } from "@/features/organizations/services/get-membership";
import { apiResponse } from "@/utils/response";

export const AUDIT_PAGE_SIZE = 25;

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

function describe(action: string, metadata: unknown): string | null {
  const meta = (metadata && typeof metadata === "object" ? metadata : {}) as Record<string, unknown>;
  const text = (key: string) => (typeof meta[key] === "string" ? (meta[key] as string) : null);
  const count = (key: string) => (typeof meta[key] === "number" ? (meta[key] as number) : null);

  switch (action) {
    case "member.role.update":
    case "organization.update":
      return text("from") && text("to") ? `${text("from")} → ${text("to")}` : null;
    case "invitation.create":
    case "invitation.resend":
      return text("role") ? `as ${text("role")}` : null;
    case "member.remove":
      return text("email");
    case "role.create":
      return count("permissions") !== null ? plural(count("permissions")!, "permission") : null;
    case "role.update": {
      const parts = [];
      if (text("renamedFrom")) parts.push(`renamed from ${text("renamedFrom")}`);
      if (count("from") !== null && count("to") !== null && count("from") !== count("to"))
        parts.push(`${count("from")} → ${plural(count("to")!, "permission")}`);
      return parts.join(", ") || null;
    }
    default:
      return null;
  }
}

const MAX_AUDIT_PAGE_SIZE = 100;

// newest first; one page at a time, since the log only grows
export const getAuditLog = async (
  organizationSlug: string,
  { page, size }: { page?: number; size?: number },
  formatDate: (date: Date) => string,
) => {
  try {
    const { organization } = await requirePermission(organizationSlug, { audit: ["read"] }, "You can't view the audit log");
    const where = { organizationId: organization.id };
    const current = Math.max(1, Math.floor(page ?? 1) || 1);
    const take = Math.min(MAX_AUDIT_PAGE_SIZE, Math.max(1, Math.floor(size ?? AUDIT_PAGE_SIZE) || AUDIT_PAGE_SIZE));

    const [rows, count] = await Promise.all([
      getAuditLogs({
        where,
        select: { id: true, actorName: true, action: true, targetLabel: true, metadata: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (current - 1) * take,
        take,
      }),
      countAuditLogs({ where }),
    ]);

    const data: AuditLogRow[] = rows
      // entries written by a newer version with an action this one doesn't know are skipped
      .filter((row) => row.action in AUDIT_ACTIONS)
      .map((row) => ({
        id: row.id,
        actorName: row.actorName,
        action: row.action as AuditAction,
        targetLabel: row.targetLabel,
        detail: describe(row.action, row.metadata),
        createdAt: formatDate(new Date(row.createdAt)),
      }));

    return apiResponse.multi({ data, count });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
