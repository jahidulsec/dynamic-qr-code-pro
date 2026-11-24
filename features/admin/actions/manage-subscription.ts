"use server";

import { refresh } from "next/cache";

import {
  cancelSubscriptionSchema,
  extendSubscriptionSchema,
  type CancelSubscriptionValues,
  type ExtendSubscriptionValues,
} from "@/features/admin/schemas/manage-subscription";
import { organizationIdSchema } from "@/features/admin/schemas/review-organization";
import { requireAdmin } from "@/features/admin/services/admin-session";
import { cancelSubscription, extendSubscription, setSubscription } from "@/features/admin/services/manage-subscription";
import { subscriptionFormSchema, type SubscriptionFormInput } from "@/features/billing";
import { sendToOwners, subscriptionChangedEmail } from "@/features/email/server";
import { formatDate } from "@/utils/format";
import { apiResponse } from "@/utils/response";

// Each action: requireAdmin → parse → one transaction (the subscription write and its admin audit entry,
// before and after in metadata) → email after the commit, when there is one (logged, never thrown) → refresh().

const adminActor = (session: Awaited<ReturnType<typeof requireAdmin>>) => ({
  id: session.user.id,
  name: session.user.name,
});

/** Creates or replaces the subscription. A plan change emails the owners unless `emailOwners` is false. */
export const setSubscriptionAction = async (
  organizationId: string,
  values: SubscriptionFormInput,
  options: { emailOwners?: boolean } = {},
) => {
  try {
    const session = await requireAdmin();
    const id = organizationIdSchema.parse(organizationId);
    const subscription = subscriptionFormSchema.parse(values);

    const result = await setSubscription(id, subscription, adminActor(session));

    if (result.planChanged && options.emailOwners !== false)
      await sendToOwners(
        result.organization.id,
        subscriptionChangedEmail({
          organizationName: result.organization.name,
          organizationSlug: result.organization.slug,
          planName: result.plan.name,
          endsOn: result.currentPeriodEnd ? formatDate(result.currentPeriodEnd) : null,
        }),
      );

    refresh();
    return apiResponse.single({
      message: `${result.organization.name} is on ${result.plan.name}`,
      data: { id: result.organization.id },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

/** +1 month, +1 year or until a date, counted from max(now, current end). Reactivates an expired subscription. */
export const extendSubscriptionAction = async (organizationId: string, values: ExtendSubscriptionValues) => {
  try {
    const session = await requireAdmin();
    const id = organizationIdSchema.parse(organizationId);
    const extend = extendSubscriptionSchema.parse(values);

    const result = await extendSubscription(id, extend, adminActor(session));

    refresh();
    return apiResponse.single({
      message: `${result.organization.name} now runs until ${formatDate(result.currentPeriodEnd)}`,
      data: { id: result.organization.id },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

/** Cancels at once: the organization falls back to the default plan's limits. */
export const cancelSubscriptionAction = async (organizationId: string, values: CancelSubscriptionValues = {}) => {
  try {
    const session = await requireAdmin();
    const id = organizationIdSchema.parse(organizationId);
    const { reason } = cancelSubscriptionSchema.parse(values);

    const result = await cancelSubscription(id, reason, adminActor(session));

    refresh();
    return apiResponse.single({
      message: `${result.organization.name}'s subscription was canceled`,
      data: { id: result.organization.id },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
