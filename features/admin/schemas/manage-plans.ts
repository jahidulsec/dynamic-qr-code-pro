import { z } from "zod";

import { PLAN_KEY_PATTERN, PLAN_LIMITS, planFormSchema, type PlanFeature, type PlanFormInput } from "@/features/billing";

export const planIdSchema = z.string().trim().min(1).max(64);

/** updatePlanAction: the create fields without `key`, which never changes after creation. */
export const planUpdateSchema = planFormSchema.omit({ key: true });

export type PlanUpdateInput = Omit<PlanFormInput, "key">;

/* ---------------------------------- Form ---------------------------------- */

// the form takes prices in major units ("9.99"); the actions take cents
const priceField = z
  .string()
  .trim()
  .regex(/^\d{1,7}(\.\d{1,2})?$/, "Use a price like 9 or 9.99");

// empty is only allowed when the limit's "Unlimited" box is ticked (checked below)
const limitField = z.string().trim().regex(/^\d{0,7}$/, "Use a whole number");

const LIMIT_FIELDS = { qrCodes: "maxQrCodes", members: "maxMembers", customRoles: "maxCustomRoles" } as const;

export const planFormFieldsSchema = z
  .object({
    key: z.string().trim().regex(PLAN_KEY_PATTERN, "Use 2–32 lowercase letters, digits or dashes, starting with a letter"),
    name: z.string().trim().min(1, "Name is required").max(64, "Name must be at most 64 characters"),
    description: z.string().max(255, "Description must be at most 255 characters"),
    priceMonthly: priceField,
    priceYearly: priceField,
    currency: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code"),
    maxQrCodes: limitField,
    maxMembers: limitField,
    maxCustomRoles: limitField,
    unlimited: z.object({ qrCodes: z.boolean(), members: z.boolean(), customRoles: z.boolean() }),
    features: z.record(z.string(), z.boolean()),
    isPublic: z.boolean(),
    sortOrder: z.string().trim().regex(/^\d{1,5}$/, "Use a whole number"),
  })
  .superRefine((value, ctx) => {
    for (const limit of PLAN_LIMITS) {
      const field = LIMIT_FIELDS[limit];
      if (!value.unlimited[limit] && !value[field])
        ctx.addIssue({ code: "custom", path: [field], message: "Enter a limit or tick Unlimited" });
    }
  });

export type PlanFormFields = z.infer<typeof planFormFieldsSchema>;

const toCents = (value: string) => Math.round(Number(value) * 100);

/** The form's fields as createPlanAction's input (prices in cents, unlimited limits as null). */
export const planFormFieldsToInput = (values: PlanFormFields): PlanFormInput => ({
  key: values.key,
  name: values.name,
  description: values.description,
  priceMonthly: toCents(values.priceMonthly),
  priceYearly: toCents(values.priceYearly),
  currency: values.currency.toUpperCase(),
  maxQrCodes: values.unlimited.qrCodes ? null : Number(values.maxQrCodes),
  maxMembers: values.unlimited.members ? null : Number(values.maxMembers),
  maxCustomRoles: values.unlimited.customRoles ? null : Number(values.maxCustomRoles),
  features: values.features as Record<PlanFeature, boolean>,
  isPublic: values.isPublic,
  sortOrder: Number(values.sortOrder),
});
