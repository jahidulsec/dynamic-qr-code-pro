import type { Prisma } from "@/generated/prisma/client";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/;

const asRecord = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

// ISO timestamps read as their date: the log is admin-facing, the full value stays in the metadata
const text = (value: unknown) =>
  typeof value === "string" ? (ISO_DATE.test(value) ? value.slice(0, 10) : value) : typeof value === "number" ? String(value) : null;

/** Plan snapshot fields, as the details line of a `plan.update` entry names them; in display order. */
const PLAN_FIELD_LABELS: Record<string, string> = {
  name: "name",
  description: "description",
  priceMonthly: "monthly price",
  priceYearly: "yearly price",
  currency: "currency",
  maxQrCodes: "QR code limit",
  maxMembers: "member limit",
  maxCustomRoles: "custom role limit",
  features: "features",
  isPublic: "visibility",
  sortOrder: "sort order",
};

const EXTEND_LABELS: Record<string, string> = { month: "1 month", year: "1 year" };

// Decimals arrive as strings, features as objects: compare by their JSON
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

const changedPlanFields = (before: Record<string, unknown>, after: Record<string, unknown>) =>
  Object.keys(PLAN_FIELD_LABELS)
    .filter((key) => !same(before[key], after[key]))
    .map((key) => PLAN_FIELD_LABELS[key]);

/** The user actions record the target's email, then what's specific to the action. */
function describeUserEntry(action: string, record: Record<string, unknown>) {
  const parts: string[] = [];
  if (text(record.email)) parts.push(String(text(record.email)));
  if (action === "user.ban") parts.push(text(record.expires) ? `Until: ${text(record.expires)}` : "Permanent");
  if (action === "user.sessions.revoke" && typeof record.sessions === "number")
    parts.push(record.sessions === 1 ? "1 session" : `${record.sessions} sessions`);
  return parts;
}

/**
 * One readable line per admin audit entry, from its action and metadata, e.g. "PENDING → ACTIVE · Plan: Pro",
 * "Free → Pro · ACTIVE · Ends: 2026-12-24" for a subscription change, or "Changed: monthly price, features"
 * for a plan edit.
 */
export function describeAdminAuditMetadata(metadata: Prisma.JsonValue | null, action?: string): string | null {
  const record = asRecord(metadata);
  if (!record) return null;
  const parts: string[] = [];
  const { from, to, plan, reason, before, after } = record;

  if (action?.startsWith("user.")) {
    parts.push(...describeUserEntry(action, record));
  } else if (asRecord(after)) {
    const next = asRecord(after)!;
    const previous = asRecord(before);
    const planText = text(next.plan);
    if (previous && text(previous.plan) !== planText) parts.push(`${text(previous.plan)} → ${planText}`);
    else if (planText) parts.push(`Plan: ${planText}`);
    if (text(next.status)) parts.push(String(text(next.status)));
    // subscription snapshots only; plan snapshots have no period
    if ("currentPeriodEnd" in next)
      parts.push(text(next.currentPeriodEnd) ? `Ends: ${text(next.currentPeriodEnd)}` : "No end date");
    if (action === "plan.create" && text(next.key)) parts.push(`Key: ${text(next.key)}`);
    if (action === "plan.update" && previous) {
      const changed = changedPlanFields(previous, next).filter((label) => label !== "name");
      if (changed.length) parts.push(`Changed: ${changed.join(", ")}`);
      else if (!parts.some((part) => part.includes("→"))) parts.push("No changes");
    }
  } else {
    if (text(from) && text(to)) parts.push(`${text(from)} → ${text(to)}`);
    // the first default has no previous one
    else if (action === "plan.default" && text(to)) parts.push(`Plan: ${text(to)}`);
    // a default change names the plan in its from → to already
    if (text(plan) && action !== "plan.default") parts.push(`Plan: ${text(plan)}`);
    if (action === "subscription.extend" && text(record.by)) parts.push(`By: ${EXTEND_LABELS[String(record.by)] ?? record.by}`);
  }
  if (text(reason)) parts.push(`Reason: ${text(reason)}`);
  return parts.length ? parts.join(" · ") : null;
}
