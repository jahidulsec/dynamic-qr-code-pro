import Link from "next/link";
import { IconBuilding } from "@tabler/icons-react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrganizationStatusBadge, PlanStateBadge } from "@/features/admin/components/organization-status-badge";
import { ADMIN_PATHS } from "@/features/admin/constants";
import type { getAdminOrganizations } from "@/features/admin/libs/admin-organizations";
import { formatDate } from "@/utils/format";

export type AdminOrganizationListItem = NonNullable<Awaited<ReturnType<typeof getAdminOrganizations>>["data"]>["items"][number];

type AdminOrganizationTableProps = {
  items: AdminOrganizationListItem[];
  /** shown for organizations without a subscription, which run on the default plan */
  defaultPlanName: string | null;
  emptyMessage: React.ReactNode;
};

export function AdminOrganizationTable({ items, defaultPlanName, emptyMessage }: AdminOrganizationTableProps) {
  if (!items.length)
    return (
      <div className="flex flex-col items-center gap-2 border-t px-4 py-16 text-center text-sm text-muted-foreground">
        <IconBuilding className="size-8" />
        {emptyMessage}
      </div>
    );

  return (
    // the table's own container scrolls sideways, so a phone scrolls the card, not the page
    <Table className="[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">Organization</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead className="text-right">QR codes</TableHead>
          <TableHead className="text-right">Members</TableHead>
          <TableHead className="pr-4">Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((organization) => (
          // the name's link stretches over the whole row, so any click on it opens the detail page
          <TableRow key={organization.id} className="relative cursor-pointer">
            <TableCell className="max-w-64 pl-4">
              <Link
                href={`${ADMIN_PATHS.organizations}/${organization.id}`}
                className="block truncate font-medium after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                title={organization.name}
              >
                {organization.name}
              </Link>
              <div className="truncate font-mono text-xs text-muted-foreground">/{organization.slug}</div>
            </TableCell>
            <TableCell className="max-w-56">
              {organization.owner ? (
                <>
                  <div className="truncate">{organization.owner.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{organization.owner.email}</div>
                </>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <OrganizationStatusBadge status={organization.status} />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{organization.plan?.name ?? defaultPlanName ?? "—"}</span>
                <PlanStateBadge state={organization.planState} />
              </div>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{organization.qrCodeCount.toLocaleString()}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{organization.memberCount.toLocaleString()}</TableCell>
            <TableCell className="pr-4 font-mono text-xs text-muted-foreground">{formatDate(organization.createdAt)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
