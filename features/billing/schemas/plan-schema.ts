import { z } from "zod";

import {
  BILLING_INTERVALS,
  PLAN_FEATURES,
  PLAN_KEY_PATTERN,
  SUBSCRIPTION_FORM_STATUSES,
  type PlanFeature,
} from "@/features/billing/constants";

export type PlanFeatures = Record<PlanFeature, boolean>;

/**
 * Keeps only known feature keys, each as a boolean (missing = off), so stored or submitted JSON
 * can never switch on a feature the catalogue doesn't define.
 */
export const normalizePlanFeatures = (input: unknown): PlanFeatures => {
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  return Object.fromEntries(PLAN_FEATURES.map((key) => [key, source[key] === true])) as PlanFeatures;
};

// minor units (cents)
const price = z.coerce.number().int("Use whole cents").min(0, "Price can't be negative").max(100_000_000);

// empty / null = unlimited
const limit = z.preprocess(
  (value) => (value === "" || value === undefined ? null : value),
  z.coerce.number().int("Use a whole number").min(0, "Limit can't be negative").max(1_000_000).nullable(),
);

export const planFormSchema = z.object({
  key: z
    .string()
    .trim()
    .regex(PLAN_KEY_PATTERN, "Use 2–32 lowercase letters, digits or dashes, starting with a letter"),
  name: z.string().trim().min(1, "Name is required").max(64, "Name must be at most 64 characters"),
  description: z
    .string()
    .trim()
    .max(255, "Description must be at most 255 characters")
    .nullish()
    .transform((value) => value || null),
  priceMonthly: price.default(0),
  priceYearly: price.default(0),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code")
    .default("USD"),
  maxQrCodes: limit,
  maxMembers: limit,
  maxCustomRoles: limit,
  // unknown keys are dropped, like normalizePermissions does for roles
  features: z.unknown().transform(normalizePlanFeatures),
  isPublic: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

export type PlanFormInput = z.input<typeof planFormSchema>;
export type PlanFormValues = z.output<typeof planFormSchema>;

export const subscriptionFormSchema = z
  .object({
    planId: z.string().trim().min(1, "Choose a plan").max(64),
    status: z.enum(SUBSCRIPTION_FORM_STATUSES),
    interval: z.enum(BILLING_INTERVALS).default("NONE"),
    currentPeriodStart: z.coerce.date(),
    // null = no end date
    currentPeriodEnd: z.preprocess(
      (value) => (value === "" || value === undefined ? null : value),
      z.coerce.date().nullable(),
    ),
    notes: z
      .string()
      .trim()
      .max(2000, "Notes must be at most 2000 characters")
      .nullish()
      .transform((value) => value || null),
  })
  .refine((value) => !value.currentPeriodEnd || value.currentPeriodEnd > value.currentPeriodStart, {
    path: ["currentPeriodEnd"],
    message: "The period end must be after the period start",
  })
  // F5: a trial without an end date would never expire
  .refine((value) => value.status !== "TRIALING" || value.currentPeriodEnd !== null, {
    path: ["currentPeriodEnd"],
    message: "A trial needs an end date",
  });

export type SubscriptionFormInput = z.input<typeof subscriptionFormSchema>;
export type SubscriptionFormValues = z.output<typeof subscriptionFormSchema>;
