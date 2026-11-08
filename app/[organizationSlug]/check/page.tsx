import type { Metadata } from "next";
import { Suspense } from "react";

import { SectionContainer, SectionIntro } from "@/components/shared/section/section";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_TITLES } from "@/features/dashboard";
import { PageHeader } from "@/features/dashboard/server";
import { getQrCodes, getQrListItem, QrCheckWorkspace, qrIdSchema, toQrCheckItem } from "@/features/qr";
import { QrCreateAction } from "@/features/qr/server";
import { getQrTags } from "@/features/qr-tags";
import type { SearchParams } from "@/types/params";
import { getQrBaseUrl } from "@/utils/short-link";

export const metadata: Metadata = {
  title: PAGE_TITLES.check,
};

// the list scrolls in place instead of paginating; search narrows it down
const CHECK_LIST_SIZE = 50;

export default async function CheckPage({ params, searchParams }: PageProps<"/[organizationSlug]/check">) {
  const { organizationSlug } = await params;

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title={PAGE_TITLES.check} />
      <SectionContainer>
        <SectionIntro
          title={PAGE_TITLES.check}
          description="Search any QR code by ID, name, tag or URL, then simulate a scan to verify its redirect and count it."
          actions={
            <Suspense fallback={<Skeleton className="h-9 w-32" />}>
              <QrCreateAction organizationSlug={organizationSlug} />
            </Suspense>
          }
        />
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

  const [list, tags] = await Promise.all([
    getQrCodes(organizationSlug, { search: search || undefined, size: CHECK_LIST_SIZE }),
    getQrTags(organizationSlug),
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
  );
}

function CheckSkeleton() {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="flex flex-col gap-3 rounded-xl p-5 ring-1 ring-foreground/10">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-9" />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-16" />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-104 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  );
}
