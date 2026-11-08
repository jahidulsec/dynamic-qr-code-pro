"use server";

import { APIError } from "better-auth/api";

import { requireOrganization } from "@/features/qr/server";
import { buildScanReport, findReportTag } from "@/features/reports/libs/reports-analytics";
import { reportQuerySchema, type ReportQueryInput } from "@/features/reports/schemas/reports-schema";
import { toCsv } from "@/utils/csv";
import { apiResponse } from "@/utils/response";

const loadReport = async (organizationSlug: string, query: ReportQueryInput) => {
  const { period, department } = reportQuerySchema.parse(query);
  const { organization } = await requireOrganization(organizationSlug);

  const tag = department ? await findReportTag(organization.id, department) : null;
  if (department && !tag) throw new APIError("NOT_FOUND", { message: `Department "${department}" not found` });

  const report = await buildScanReport({ organizationId: organization.id, tag, period });
  return { organization, report };
};

export const getScanReport = async (organizationSlug: string, query: ReportQueryInput) => {
  try {
    const { report } = await loadReport(organizationSlug, query);
    return apiResponse.single({ data: report });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const exportScanReport = async (organizationSlug: string, query: ReportQueryInput) => {
  try {
    const { organization, report } = await loadReport(organizationSlug, query);
    const department = report.department ?? "All departments";
    const percent = (value: number) => value.toFixed(1);

    // one file, several tables separated by a blank line; only the first keeps the BOM
    const sections = [
      toCsv(
        ["Report", "Value"],
        [
          ["Organization", organization.name],
          ["Period", report.period],
          ["Department", department],
          ["Window start", report.windowStart],
          ["Total scans", report.total],
          ["Previous period scans", report.previousTotal],
          ["Change (%)", report.change === null ? "" : percent(report.change)],
          ["Peak interval", report.peak ? `${report.peak.label} (${report.peak.scans})` : ""],
          ["Active QR codes", `${report.active} of ${report.campaigns}`],
        ],
      ),
      toCsv(
        ["Interval", "Scans"],
        report.series.map((point) => [point.fullLabel, point.scans]),
      ),
      toCsv(
        ["Department tag", "QR codes", "Scans", "Share (%)"],
        report.distribution.map((row) => [row.name ?? "Untagged", row.qrCount, row.scans, percent(row.percent)]),
      ),
      toCsv(
        ["ID", "Campaign", "Tags", "Destination", "Scans"],
        report.top.map((row) => [row.id, row.name, row.tags.join(", "), row.destination, row.scans]),
      ),
    ].map((section, index) => (index === 0 ? section : section.replace(/^﻿/, "")));

    const slug = (report.department ?? "all").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const date = new Date().toISOString().slice(0, 10);

    return apiResponse.single({
      data: { fileName: `${organization.slug}-scan-report-${report.period}-${slug}-${date}.csv`, csv: sections.join("\r\n") },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
