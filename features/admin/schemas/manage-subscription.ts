import { z } from "zod";

import { BILLING_INTERVALS, SUBSCRIPTION_FORM_STATUSES } from "@/features/billing";
import { endOfLocalDay, REVIEW_REASON_MAX } from "@/features/admin/schemas/review-organization";

/* ------------------------------- Change plan ------------------------------- */

// setSubscriptionAction validates with billing's subscriptionFormSchema

/** The start of `yyyy-mm-dd` in the browser's time zone. */
export const startOfLocalDay = (value: string) => new Date(`${value}T00:00:00`);

/** The change-plan dialog's fields; dates stay date-input strings until submit. */
export const changePlanFormSchema = z
  .object({
    planId: z.string().trim().min(1, "Choose a plan"),
    status: z.enum(SUBSCRIPTION_FORM_STATUSES),
    interval: z.enum(BILLING_INTERVALS),
    currentPeriodStart: z.string().min(1, "Choose a start date"),
    currentPeriodEnd: z.string(),
    notes: z.string().max(2000, "Notes must be at most 2000 characters"),
    emailOwners: z.boolean(),
  })
  .refine(
    (value) =>
      !value.currentPeriodEnd ||
      !value.currentPeriodStart ||
      endOfLocalDay(value.currentPeriodEnd) > startOfLocalDay(value.currentPeriodStart),
    { path: ["currentPeriodEnd"], message: "The period end must be after the period start" },
  )
  // F5: a trial without an end date would never expire
  .refine((value) => value.status !== "TRIALING" || !!value.currentPeriodEnd, {
    path: ["currentPeriodEnd"],
    message: "A trial needs an end date",
  });

export type ChangePlanFormValues = z.infer<typeof changePlanFormSchema>;

/* --------------------------------- Extend --------------------------------- */

export const EXTEND_STEPS = ["month", "year"] as const;

export const extendSubscriptionSchema = z.union([
  z.object({ by: z.enum(EXTEND_STEPS) }),
  z.object({ until: z.coerce.date() }),
]);

export type ExtendSubscriptionValues = z.input<typeof extendSubscriptionSchema>;

export const extendFormSchema = z
  .object({ mode: z.enum([...EXTEND_STEPS, "until"]), until: z.string() })
  .refine((value) => value.mode !== "until" || !!value.until, { path: ["until"], message: "Choose a date" })
  .refine((value) => value.mode !== "until" || !value.until || endOfLocalDay(value.until).getTime() > Date.now(), {
    path: ["until"],
    message: "The new end must be in the future",
  });

export type ExtendFormValues = z.infer<typeof extendFormSchema>;

/* --------------------------------- Cancel --------------------------------- */

export const cancelSubscriptionSchema = z.object({
  // admin-only: recorded in the admin audit log, never shown to the organization
  reason: z
    .string()
    .trim()
    .max(REVIEW_REASON_MAX, `Keep the reason under ${REVIEW_REASON_MAX} characters`)
    .optional()
    .transform((value) => value || undefined),
});

export type CancelSubscriptionValues = z.input<typeof cancelSubscriptionSchema>;
