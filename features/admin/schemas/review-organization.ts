import { z } from "zod";

export const organizationIdSchema = z.string().trim().min(1).max(64);

export const REVIEW_REASON_MIN = 3;
export const REVIEW_REASON_MAX = 500;

/** Reject and suspend: shown to the organization's owners, in their list, status screen and email. */
export const reviewReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(REVIEW_REASON_MIN, `Give a reason of at least ${REVIEW_REASON_MIN} characters`)
    .max(REVIEW_REASON_MAX, `Keep the reason under ${REVIEW_REASON_MAX} characters`),
});

export type ReviewReasonValues = z.infer<typeof reviewReasonSchema>;

export const APPROVE_SUBSCRIPTION_STATUSES = ["ACTIVE", "TRIALING"] as const;

export const approveOrganizationSchema = z.object({
  planId: z.string().trim().min(1, "Choose a plan").max(64),
  // optional; no end date means the subscription runs until an admin changes it
  currentPeriodEnd: z.coerce
    .date()
    .refine((date) => date.getTime() > Date.now(), "The period end must be in the future")
    .optional(),
  status: z.enum(APPROVE_SUBSCRIPTION_STATUSES).default("ACTIVE"),
});

export type ApproveOrganizationValues = z.input<typeof approveOrganizationSchema>;

/** The end of `yyyy-mm-dd` in the browser's time zone, so "ends on the 5th" includes the 5th. */
export const endOfLocalDay = (value: string) => new Date(`${value}T23:59:59.999`);

/** The approve dialog's fields: the date stays the date input's string until submit. */
export const approveOrganizationFormSchema = z.object({
  planId: z.string().trim().min(1, "Choose a plan"),
  status: z.enum(APPROVE_SUBSCRIPTION_STATUSES),
  currentPeriodEnd: z
    .string()
    .refine((value) => !value || endOfLocalDay(value).getTime() > Date.now(), "The period end must be in the future"),
});

export type ApproveOrganizationFormValues = z.infer<typeof approveOrganizationFormSchema>;
