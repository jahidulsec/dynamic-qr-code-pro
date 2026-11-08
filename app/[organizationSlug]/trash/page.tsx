import type { Metadata } from "next";
import { IconTrash } from "@tabler/icons-react";

import { Section, SectionContainer, SectionEmpty, SectionIntro, SectionMeta } from "@/components/shared/section/section";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PAGE_TITLES } from "@/features/dashboard";
import { PageHeader } from "@/features/dashboard/server";
import { getTrashedQrCodes, qrTagNames, TrashRowActions } from "@/features/qr";
import { isOrganizationAdmin } from "@/features/qr/server";
import { formatDate, formatTags, shortLinkLabel } from "@/utils/format";
import { getQrBaseUrl } from "@/utils/short-link";

export const metadata: Metadata = {
  title: PAGE_TITLES.trash,
};

export default async function TrashPage({ params }: PageProps<"/[organizationSlug]/trash">) {
  const { organizationSlug } = await params;

  const [trashed, canDelete] = await Promise.all([
    getTrashedQrCodes(organizationSlug),
    isOrganizationAdmin(organizationSlug),
  ]);
  const items = trashed.data ?? [];
  const baseUrl = getQrBaseUrl();

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title={PAGE_TITLES.trash} />
      <SectionContainer>
        <SectionIntro
          title={PAGE_TITLES.trash}
          description="Trashed QR codes stop redirecting but keep their scan history. Restore one to switch it back on."
          actions={
            items.length > 0 && (
              <SectionMeta>
                {items.length} {items.length === 1 ? "code" : "codes"}
              </SectionMeta>
            )
          }
        />
        <Section className="overflow-hidden">
          {items.length ? (
            <Table>
              <TableHeader>
                <TableRow className="text-xs uppercase">
                  <TableHead className="pl-4">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Scans</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Trashed</TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell className="pl-4 font-mono font-medium">#&nbsp;{qr.id}</TableCell>
                    <TableCell className="max-w-72">
                      <div className="truncate font-medium">{qr.name}</div>
                      <div className="truncate font-mono text-xs text-muted-foreground">
                        {shortLinkLabel(baseUrl, qr.slug)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">{qr.scanCount.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-xs">{formatTags(qrTagNames(qr))}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {qr.deletedAt && formatDate(qr.deletedAt)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <TrashRowActions
                        organizationSlug={organizationSlug}
                        qr={{ id: qr.id, name: qr.name }}
                        canDelete={canDelete}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <SectionEmpty icon={<IconTrash />}>
              {trashed.success ? "The trash is empty." : trashed.message}
            </SectionEmpty>
          )}
        </Section>
      </SectionContainer>
    </>
  );
}
