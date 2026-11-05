import { z } from "zod";

export const REPORT_PERIODS = ["daily", "weekly", "monthly", "yearly"] as const;
export type ReportPeriod = (typeof REPORT_PERIODS)[number];

export const reportQuerySchema = z.object({
  period: z.enum(REPORT_PERIODS).catch("weekly"),
  // tag names are stored upper-case; an empty value means every department
  department: z
    .string()
    .trim()
    .toUpperCase()
    .optional()
    .catch(undefined)
    .transform((value) => value || undefined),
});

export type ReportQueryInput = z.input<typeof reportQuerySchema>;
export type ReportQuery = z.output<typeof reportQuerySchema>;

const urlParam = z.string().optional().catch(undefined);

// the reports URL (?period=&department=) mapped onto the report query; `department` is shared with the sidebar
export const reportSearchParamsSchema = z
  .object({ period: urlParam, department: urlParam })
  .transform((params) => reportQuerySchema.parse(params));
