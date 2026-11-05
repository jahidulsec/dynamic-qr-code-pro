import type { Metadata } from "next";
import { Suspense } from "react";
import { IconChartLine } from "@tabler/icons-react";

import {
  Section,
  SectionActions,
  SectionBadge,
  SectionContainer,
  SectionDescription,
  SectionEyebrow,
  SectionHeader,
  SectionHero,
  SectionTitle,
} from "@/components/shared/section/section";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/features/dashboard/server";
import { getOrganizationBySlug } from "@/features/organizations/server";
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
  title: "Graph Reports",
};

export default async function ReportsPage({ params, searchParams }: PageProps<"/[organizationSlug]/reports">) {
  const { organizationSlug } = await params;

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title="Graph Reports" />
      <SectionContainer>
        <Suspense fallback={<ReportsSkeleton />}>
          <ReportsSection organizationSlug={organizationSlug} searchParams={searchParams} />
        </Suspense>
      </SectionContainer>
    </>
  );
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

  const header = (
    <SectionHero>
      <SectionHeader>
        <SectionEyebrow>
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Graph analytics &amp; reporting engine
          </span>
          <SectionBadge>Live Dynamic Telemetry</SectionBadge>
        </SectionEyebrow>
        <SectionTitle as="h1">Scan Performance Graph Reports</SectionTitle>
        <SectionDescription>
          Filter scan volume by daily, weekly, monthly or yearly horizons and by department campaign tags.
        </SectionDescription>
      </SectionHeader>
      <SectionActions>
        <ReportsToolbar
          organizationSlug={organizationSlug}
          period={query.period}
          department={query.department ?? null}
        />
      </SectionActions>
    </SectionHero>
  );

  if (!result.data) {
    return (
      <>
        {header}
        <Section className="p-5">
          <SectionDescription>{result.message}</SectionDescription>
        </Section>
      </>
    );
  }

  const report = result.data;

  return (
    <>
      {header}

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

      <div className="grid gap-4 xl:grid-cols-2">
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
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </>
  );
}
