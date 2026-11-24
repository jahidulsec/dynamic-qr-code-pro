import { z } from "zod";

import { BAN_DURATIONS, type BanDuration } from "@/features/admin/constants";
import { REVIEW_REASON_MAX, REVIEW_REASON_MIN } from "@/features/admin/schemas/review-organization";

export const userIdSchema = z.string().trim().min(1).max(64);

const BAN_DURATION_KEYS = Object.keys(BAN_DURATIONS) as [BanDuration, ...BanDuration[]];

/** The Ban dialog: a reason for the record, and how long the ban lasts. */
export const banUserSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(REVIEW_REASON_MIN, `Give a reason of at least ${REVIEW_REASON_MIN} characters`)
    .max(REVIEW_REASON_MAX, `Keep the reason under ${REVIEW_REASON_MAX} characters`),
  duration: z.enum(BAN_DURATION_KEYS),
});

export type BanUserValues = z.infer<typeof banUserSchema>;
