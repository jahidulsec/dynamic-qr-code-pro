import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconTrash } from "@tabler/icons-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/features/dashboard/components/page-header";
import { getOrganizationBySlug, getSession } from "@/features/organizations/services/get-organization";
import { TrashRowActions } from "@/features/qr/components/trash-row-actions";
import { getTrashedQrCodes } from "@/features/qr/libs/qr";
import { isAdminRole } from "@/features/qr/services/require-organization";
import { formatDate, shortLinkLabel } from "@/utils/format";
import { getQrBaseUrl } from "@/utils/short-link";

export const metadata: Metadata = {
  title: "Trash Bin",
};

export default async function TrashPage({ params }: PageProps<"/[organizationSlug]/trash">) {
  const { organizationSlug } = await params;

  const [organization, session] = await Promise.all([getOrganizationBySlug(organizationSlug), getSession()]);
  if (!organization || !session) notFound();

  const trashed = await getTrashedQrCodes(organization.slug);
  const items = trashed.data ?? [];
  const role = organization.members.find((member) => member.userId === session.user.id)?.role ?? "";
  const canDelete = isAdminRole(role);
  const baseUrl = getQrBaseUrl();

  return (
    <>
      <PageHeader organizationName={organization.name} title="Trash Bin" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <p className="text-sm text-muted-foreground">
          Trashed QR codes stop redirecting but keep their scan history. Restore one to switch it back on.
        </p>
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          {items.length ? (
            <Table>
              <TableHeader>
                <TableRow className="text-xs uppercase">
                  <TableHead className="pl-4">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Scans</TableHead>
                  <TableHead>Tag</TableHead>
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
                    <TableCell className="font-mono text-xs">{qr.tag?.name ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {qr.deletedAt && formatDate(qr.deletedAt)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <TrashRowActions
                        organizationSlug={organization.slug}
                        qr={{ id: qr.id, name: qr.name }}
                        canDelete={canDelete}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-2 px-4 py-16 text-center text-sm text-muted-foreground">
              <IconTrash className="size-8" />
              {trashed.success ? "The trash is empty." : trashed.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
