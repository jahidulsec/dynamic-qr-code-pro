import { APIError } from "better-auth/api";

import prisma from "@/config/db";
import { Prisma } from "@/generated/prisma/client";
import { ADMIN_AUDIT_TAGS, writeAdminAudit } from "@/features/admin/libs/admin-audit";
import { normalizePlanFeatures, type PlanFormValues } from "@/features/billing";
import { mutate } from "@/lib/cache/shared";
import { cacheTags } from "@/lib/cache/cache-tags";

// not organization-scoped: only reachable through actions that call requireAdmin()

type Admin = { id: string; name: string };

export type PlanUpdateValues = Omit<PlanFormValues, "key">;

const planSnapshotSelect = {
  id: true,
  key: true,
  name: true,
  description: true,
  priceMonthly: true,
  priceYearly: true,
  currency: true,
  maxQrCodes: true,
  maxMembers: true,
  maxCustomRoles: true,
  features: true,
  isDefault: true,
  isPublic: true,
  sortOrder: true,
  archivedAt: true,
} satisfies Prisma.PlanSelect;

type PlanSnapshot = Prisma.PlanGetPayload<{ select: typeof planSnapshotSelect }>;

/** The audit log's before/after picture of a plan (dates as ISO strings). */
const snapshot = ({ archivedAt, features, ...row }: PlanSnapshot): Prisma.InputJsonObject => ({
  ...row,
  // `plan` is what the audit log's details line shows
  plan: row.name,
  features: normalizePlanFeatures(features),
  archivedAt: archivedAt ? archivedAt.toISOString() : null,
});

const writeTags = [
  cacheTags.plans,
  cacheTags.planCount,
  // entitlements and the organizations list read through the plan
  cacheTags.subscriptions,
  cacheTags.organizations,
  ...ADMIN_AUDIT_TAGS,
];

const findPlan = async (tx: Prisma.TransactionClient, id: string) => {
  const plan = await tx.plan.findUnique({ where: { id }, select: planSnapshotSelect });
  if (!plan) throw new APIError("NOT_FOUND", { message: "Plan not found" });
  return plan;
};

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

const changedMeanwhile = () =>
  new APIError("CONFLICT", { message: "The plan was changed by someone else. Reload and try again." });

/* ------------------------------ Create / update ------------------------------ */

/** A new plan is never the default and never archived; setDefaultPlan and archivePlan change those. */
export const createPlan = (values: PlanFormValues, admin: Admin) =>
  mutate(async () => {
    try {
      return await prisma.$transaction(async (tx) => {
        const taken = await tx.plan.findUnique({ where: { key: values.key }, select: { id: true } });
        if (taken) throw new APIError("CONFLICT", { message: `A plan with the key "${values.key}" already exists` });

        const plan = await tx.plan.create({ data: { ...values, isDefault: false }, select: planSnapshotSelect });

        await writeAdminAudit(tx, {
          actor: admin,
          action: "plan.create",
          targetType: "plan",
          targetId: plan.id,
          targetLabel: plan.name,
          metadata: { after: snapshot(plan) },
        });

        return plan;
      });
    } catch (error) {
      // two admins creating the same key at once: the unique index catches the second
      if (isUniqueViolation(error))
        throw new APIError("CONFLICT", { message: `A plan with the key "${values.key}" already exists` });
      throw error;
    }
  }, writeTags);

/** Every field but the key, which never changes. Applies at once to every organization on the plan. */
export const updatePlan = (id: string, values: PlanUpdateValues, admin: Admin) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const before = await findPlan(tx, id);
        const after = await tx.plan.update({ where: { id }, data: values, select: planSnapshotSelect });

        await writeAdminAudit(tx, {
          actor: admin,
          action: "plan.update",
          targetType: "plan",
          targetId: after.id,
          targetLabel: after.name,
          metadata: { before: snapshot(before), after: snapshot(after) },
        });

        return after;
      }),
    writeTags,
  );

/* --------------------------------- Default --------------------------------- */

/**
 * Makes `id` the one default plan. The old default is cleared in the same transaction, and both writes
 * are locking reads, so two admins switching the default at once still leave exactly one.
 */
export const setDefaultPlan = (id: string, admin: Admin) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const plan = await findPlan(tx, id);
        if (plan.isDefault) throw new APIError("CONFLICT", { message: `${plan.name} is already the default plan` });
        if (plan.archivedAt)
          throw new APIError("BAD_REQUEST", { message: "Unarchive the plan before making it the default" });

        const previous = await tx.plan.findFirst({ where: { isDefault: true }, select: { id: true, name: true } });

        await tx.plan.updateMany({ where: { isDefault: true, id: { not: id } }, data: { isDefault: false } });
        // conditional, so a plan archived meanwhile can't become the default
        const { count } = await tx.plan.updateMany({ where: { id, archivedAt: null }, data: { isDefault: true } });
        if (!count) throw changedMeanwhile();

        await writeAdminAudit(tx, {
          actor: admin,
          action: "plan.default",
          targetType: "plan",
          targetId: plan.id,
          targetLabel: plan.name,
          metadata: { plan: plan.name, from: previous?.name ?? null, to: plan.name },
        });

        return plan;
      }),
    writeTags,
  );

/* --------------------------------- Archive --------------------------------- */

/** Archived plans can't be newly assigned; organizations already on one stay on it. The default can't be archived. */
export const archivePlan = (id: string, admin: Admin) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const plan = await findPlan(tx, id);
        if (plan.isDefault)
          throw new APIError("BAD_REQUEST", { message: "The default plan can't be archived. Make another plan the default first." });
        if (plan.archivedAt) throw new APIError("CONFLICT", { message: `${plan.name} is already archived` });

        // conditional on isDefault, so a plan made the default meanwhile is never archived
        const { count } = await tx.plan.updateMany({
          where: { id, isDefault: false, archivedAt: null },
          data: { archivedAt: new Date() },
        });
        if (!count) throw changedMeanwhile();

        await writeAdminAudit(tx, {
          actor: admin,
          action: "plan.archive",
          targetType: "plan",
          targetId: plan.id,
          targetLabel: plan.name,
          metadata: { plan: plan.name },
        });

        return plan;
      }),
    writeTags,
  );

export const unarchivePlan = (id: string, admin: Admin) =>
  mutate(
    () =>
      prisma.$transaction(async (tx) => {
        const plan = await findPlan(tx, id);
        if (!plan.archivedAt) throw new APIError("CONFLICT", { message: `${plan.name} isn't archived` });

        const { count } = await tx.plan.updateMany({
          where: { id, archivedAt: { not: null } },
          data: { archivedAt: null },
        });
        if (!count) throw changedMeanwhile();

        await writeAdminAudit(tx, {
          actor: admin,
          action: "plan.unarchive",
          targetType: "plan",
          targetId: plan.id,
          targetLabel: plan.name,
          metadata: { plan: plan.name },
        });

        return plan;
      }),
    writeTags,
  );
