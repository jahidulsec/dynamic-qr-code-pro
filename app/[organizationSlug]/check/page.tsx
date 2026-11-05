import type { Metadata } from "next";
import { Suspense } from "react";
import { IconScan } from "@tabler/icons-react";

import {
  SectionContainer,
  SectionBadge,
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
  getQrCodes,
  getQrListItem,
  QrCheckWorkspace,
  QrCreateButton,
  qrIdSchema,
  toQrCheckItem,
} from "@/features/qr";
import { getQrTags } from "@/features/qr-tags";
import type { SearchParams } from "@/types/params";
import { getQrBaseUrl } from "@/utils/short-link";

export const metadata: Metadata = {
  title: "Click to Check",
};

// the list scrolls in place instead of paginating; search narrows it down
const CHECK_LIST_SIZE = 50;

export default async function CheckPage({ params, searchParams }: PageProps<"/[organizationSlug]/check">) {
  const { organizationSlug } = await params;

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title="Click to Check" />
      <SectionContainer>
        <Suspense fallback={<CheckSkeleton />}>
          <CheckSection organizationSlug={organizationSlug} searchParams={searchParams} />
        </Suspense>
      </SectionContainer>
    </>
  );
}

const single = (value: string | string[] | undefined) => (typeof value === "string" ? value.trim() : "");

async function CheckSection({
  organizationSlug,
  searchParams,
}: {
  organizationSlug: string;
  searchParams: Promise<SearchParams>;
}) {
  const query = await searchParams;
  const search = single(query.q);
  const requestedId = qrIdSchema.safeParse(single(query.id) || undefined);

  const [list, tags, organization] = await Promise.all([
    getQrCodes(organizationSlug, { search: search || undefined, size: CHECK_LIST_SIZE }),
    getQrTags(organizationSlug),
    getOrganizationBySlug(organizationSlug),
  ]);

  const baseUrl = getQrBaseUrl();
  const tagNames = (tags.data ?? []).map((tag) => tag.name);
  const now = new Date();
  const items = (list.data ?? []).map((qr) => toQrCheckItem(qr, baseUrl, now));

  // a shared link keeps its code even when the search no longer lists it; otherwise start on the first result
  let selected = requestedId.success ? (items.find((item) => item.id === requestedId.data) ?? null) : null;
  if (!selected && requestedId.success) {
    const pinned = await getQrListItem(organizationSlug, requestedId.data);
    if (pinned.data) selected = toQrCheckItem(pinned.data, baseUrl, now);
  }
  selected ??= items[0] ?? null;

  return (
    <>
      <SectionHero>
        <SectionHeader>
          <SectionEyebrow>
            <SectionBadge>
              <IconScan />
              Dynamic Verification Suite
            </SectionBadge>
            {organization?.name && <span className="font-mono text-xs text-muted-foreground">{organization.name}</span>}
          </SectionEyebrow>
          <SectionTitle as="h1">Click to Check · Live Search &amp; Test Scanner</SectionTitle>
          <SectionDescription>
            Search any dynamic QR code by ID, name, tag or URL to simulate a mobile scan, verify dynamic redirect routing,
            and increment the scan counter.
          </SectionDescription>
        </SectionHeader>
        <QrCreateButton
          className="shrink-0 self-start lg:self-auto"
          organizationSlug={organizationSlug}
          baseUrl={baseUrl}
          tags={tagNames}
        >
          Generate New QR
        </QrCreateButton>
      </SectionHero>

      <QrCheckWorkspace
        organizationSlug={organizationSlug}
        baseUrl={baseUrl}
        tags={tagNames}
        items={items}
        count={list.count}
        selected={selected}
        emptyMessage={
          !list.success
            ? list.message
            : search
              ? "No QR codes match this search."
              : "No QR codes yet. Generate your first one to start testing scans."
        }
      />
    </>
  );
}

function CheckSkeleton() {
  return (
    <>
      <Skeleton className="h-32 rounded-xl" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl p-5 ring-1 ring-foreground/10">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9" />
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-[26rem] rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    </>
  );
}
