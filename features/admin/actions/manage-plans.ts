"use server";

import { refresh } from "next/cache";

import { planIdSchema, planUpdateSchema, type PlanUpdateInput } from "@/features/admin/schemas/manage-plans";
import { requireAdmin } from "@/features/admin/services/admin-session";
import {
  archivePlan,
  createPlan,
  setDefaultPlan,
  unarchivePlan,
  updatePlan,
} from "@/features/admin/services/manage-plans";
import { planFormSchema, type PlanFormInput } from "@/features/billing";
import { apiResponse } from "@/utils/response";

// Each action: requireAdmin → parse (unknown feature keys are dropped) → one transaction (the plan write and
// its admin audit entry) → refresh().

const adminActor = (session: Awaited<ReturnType<typeof requireAdmin>>) => ({
  id: session.user.id,
  name: session.user.name,
});

export const createPlanAction = async (values: PlanFormInput) => {
  try {
    const session = await requireAdmin();
    const plan = await createPlan(planFormSchema.parse(values), adminActor(session));

    refresh();
    return apiResponse.single({ message: `${plan.name} was created`, data: { id: plan.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

/** The key can't be changed, so it isn't part of the input. */
export const updatePlanAction = async (planId: string, values: PlanUpdateInput) => {
  try {
    const session = await requireAdmin();
    const id = planIdSchema.parse(planId);
    const plan = await updatePlan(id, planUpdateSchema.parse(values), adminActor(session));

    refresh();
    return apiResponse.single({ message: `${plan.name} was saved`, data: { id: plan.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

/** Clears the previous default in the same transaction. */
export const setDefaultPlanAction = async (planId: string) => {
  try {
    const session = await requireAdmin();
    const plan = await setDefaultPlan(planIdSchema.parse(planId), adminActor(session));

    refresh();
    return apiResponse.single({ message: `${plan.name} is now the default plan`, data: { id: plan.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

/** The default plan can't be archived. */
export const archivePlanAction = async (planId: string) => {
  try {
    const session = await requireAdmin();
    const plan = await archivePlan(planIdSchema.parse(planId), adminActor(session));

    refresh();
    return apiResponse.single({ message: `${plan.name} was archived`, data: { id: plan.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const unarchivePlanAction = async (planId: string) => {
  try {
    const session = await requireAdmin();
    const plan = await unarchivePlan(planIdSchema.parse(planId), adminActor(session));

    refresh();
    return apiResponse.single({ message: `${plan.name} was unarchived`, data: { id: plan.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
