import type { Metadata } from "next";
import { Suspense } from "react";
import { IconChartLine } from "@tabler/icons-react";

import {
  Section,
  SectionContainer,
  SectionDescription,
  SectionIntro,
  SectionTitle,
} from "@/components/shared/section/section";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_TITLES } from "@/features/dashboard";
import { PageHeader } from "@/features/dashboard/server";
import { getOrganizationBySlug, hasPermission } from "@/features/organizations/server";
import {
  getScanReport,
  reportSearchParamsSchema,
  ReportsStats,
  ReportsToolbar,
  ScanTrendChart,
  TagDistribution,
  TopCampaigns,
  type ReportPeriod,
} from "@/features/reports";
import type { SearchParams } from "@/types/params";

export const metadata: Metadata = {
  title: PAGE_TITLES.reports,
};

export default async function ReportsPage({ params, searchParams }: PageProps<"/[organizationSlug]/reports">) {
  const { organizationSlug } = await params;

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title={PAGE_TITLES.reports} />
      <SectionContainer>
        <SectionIntro
          title={PAGE_TITLES.reports}
          description="Scan volume over daily, weekly, monthly or yearly periods, filtered by department."
          actions={
            <Suspense fallback={<Skeleton className="h-9 w-96 max-w-full" />}>
              <ReportsActions organizationSlug={organizationSlug} searchParams={searchParams} />
            </Suspense>
          }
        />
        <Suspense fallback={<ReportsSkeleton />}>
          <ReportsSection organizationSlug={organizationSlug} searchParams={searchParams} />
        </Suspense>
      </SectionContainer>
    </>
  );
}

async function ReportsActions({
  organizationSlug,
  searchParams,
}: {
  organizationSlug: string;
  searchParams: Promise<SearchParams>;
}) {
  const [query, canRead] = await Promise.all([
    searchParams.then((params) => reportSearchParamsSchema.parse(params)),
    hasPermission(organizationSlug, { report: ["read"] }),
  ]);
  // without report access the section below explains why; there is nothing to filter
  if (!canRead) return null;

  return <ReportsToolbar organizationSlug={organizationSlug} period={query.period} department={query.department ?? null} />;
}

async function ReportsSection({
  organizationSlug,
  searchParams,
}: {
  organizationSlug: string;
  searchParams: Promise<SearchParams>;
}) {
  const query = reportSearchParamsSchema.parse(await searchParams);
  const [result, organization] = await Promise.all([
    getScanReport(organizationSlug, query),
    getOrganizationBySlug(organizationSlug),
  ]);

  const basePath = `/${organizationSlug}/reports`;
  const hrefFor = (period: ReportPeriod, department: string | null) => {
    const params = new URLSearchParams();
    if (period !== "weekly") params.set("period", period);
    if (department) params.set("department", department);
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  if (!result.data) {
    return (
      <Section className="p-5">
        <SectionDescription>{result.message}</SectionDescription>
      </Section>
    );
  }

  const report = result.data;

  return (
    <>
      <ReportsStats report={report} organizationName={organization?.name} />

      <Section className="p-5">
        <div className="mb-4 flex flex-col gap-1">
          <SectionTitle>
            <IconChartLine aria-hidden />
            Scan Velocity &amp; Trends <span className="text-muted-foreground uppercase">({report.period} report)</span>
          </SectionTitle>
          <SectionDescription>
            Hover over the graph to inspect scan volume for each interval.
            {report.total === 0 && " No scans were recorded in this period."}
          </SectionDescription>
        </div>
        <ScanTrendChart data={report.series} />
      </Section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <TagDistribution
          rows={report.distribution}
          selected={report.department}
          hrefFor={(department) => hrefFor(report.period, department)}
        />
        <TopCampaigns organizationSlug={organizationSlug} rows={report.top} department={report.department} />
      </div>
    </>
  );
}

function ReportsSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </>
  );
}
