import Link from "next/link";
import {
  IconBuilding,
  IconClockHour4,
  IconHistory,
  IconHourglassLow,
  IconInbox,
  IconQrcode,
  IconScan,
  IconUsers,
} from "@tabler/icons-react";

import { Section, SectionCardHeader, SectionEmpty, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReviewReasonDialog } from "@/features/admin/components/review-reason-dialog";
import { ADMIN_EXPIRING_DAYS, ADMIN_PATHS } from "@/features/admin/constants";
import { ADMIN_AUDIT_ACTIONS, type AdminAuditAction } from "@/features/admin/libs/admin-audit-actions";
import type { getAdminDashboard } from "@/features/admin/libs/admin-stats";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

export type AdminDashboardData = NonNullable<Awaited<ReturnType<typeof getAdminDashboard>>["data"]>;

// renders on the server only: dates are formatted in the server's time zone
const formatDateTime = (date: Date) =>
  `${formatDate(date)}, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

const organizationsPath = (params: string) => `${ADMIN_PATHS.organizations}?${params}`;

/** /admin (spec 04): stat tiles, the oldest pending requests and recent admin activity. */
export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const { stats, pending, activity } = data;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatTile
          label="Pending requests"
          icon={<IconInbox />}
          value={stats.pending}
          href={organizationsPath("status=pending")}
          highlight={stats.pending > 0}
          hint={stats.pending ? "Waiting for review" : "Nothing to review"}
        />
        <StatTile
          label="Active organizations"
          icon={<IconBuilding />}
          value={stats.active}
          href={organizationsPath("status=active")}
        />
        <StatTile
          label="Users"
          icon={<IconUsers />}
          value={stats.users}
          href={ADMIN_PATHS.users}
          extra={stats.newUsers > 0 ? `+${stats.newUsers.toLocaleString()} this week` : undefined}
        />
        <StatTile label="QR codes" icon={<IconQrcode />} value={stats.qrCodes} hint="Live, across all organizations" />
        <StatTile label="Scans (30 days)" icon={<IconScan />} value={stats.scans} hint="Across all organizations" />
        <StatTile
          label="Expiring soon"
          icon={<IconHourglassLow />}
          value={stats.expiring}
          // every status: pending organizations have no subscription, so the default Pending tab would show none
          href={organizationsPath(`status=all&expiring=${ADMIN_EXPIRING_DAYS}`)}
          hint={`Trial or active plans ending in the next ${ADMIN_EXPIRING_DAYS} days`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PendingRequests pending={pending} total={stats.pending} />
        <RecentActivity activity={activity} />
      </div>
    </>
  );
}

type StatTileProps = {
  label: string;
  icon: React.ReactNode;
  value: number;
  href?: string;
  hint?: string;
  extra?: string;
  highlight?: boolean;
};

function StatTile({ label, icon, value, href, hint, extra, highlight }: StatTileProps) {
  const card = (
    <Card size="sm" className={cn("h-full", href && "transition-colors group-hover:bg-muted/50")}>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
        <span className={cn("[&_svg]:size-4", highlight ? "text-primary" : "text-muted-foreground")}>{icon}</span>
      </CardHeader>
      <CardContent className="gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold tabular-nums">{value.toLocaleString()}</span>
          {extra && <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{extra}</span>}
        </div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );

  if (!href) return card;
  return (
    <Link
      href={href}
      className="group rounded-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {card}
    </Link>
  );
}

function PendingRequests({ pending, total }: { pending: AdminDashboardData["pending"]; total: number }) {
  return (
    <Section className="overflow-hidden">
      <SectionCardHeader>
        <div className="flex items-center gap-3">
          <SectionLabel>Pending requests</SectionLabel>
          <SectionMeta>{total}</SectionMeta>
        </div>
        {total > pending.length && (
          <Link href={organizationsPath("status=pending")} className="text-xs font-medium hover:underline">
            View all
          </Link>
        )}
      </SectionCardHeader>
      {pending.length ? (
        <Table>
          <TableHeader>
            <TableRow className="text-xs uppercase">
              <TableHead className="pl-4">Organization</TableHead>
              <TableHead>Requested by</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell className="pl-4">
                  <div className="font-medium">{organization.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">/{organization.slug}</div>
                </TableCell>
                <TableCell>
                  {organization.requester ? (
                    <>
                      <div>{organization.requester.name}</div>
                      <div className="text-xs text-muted-foreground">{organization.requester.email}</div>
                    </>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                  {formatDate(organization.createdAt)}
                </TableCell>
                <TableCell className="pr-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`${ADMIN_PATHS.organizations}/${organization.id}`} />}
                    >
                      Review
                    </Button>
                    <ReviewReasonDialog
                      mode="reject"
                      organization={{ id: organization.id, name: organization.name }}
                      trigger={<Button size="sm" variant="outline" />}
                    >
                      Reject
                    </ReviewReasonDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <SectionEmpty icon={<IconClockHour4 />}>No requests waiting for review.</SectionEmpty>
      )}
    </Section>
  );
}

function RecentActivity({ activity }: { activity: AdminDashboardData["activity"] }) {
  return (
    <Section className="overflow-hidden">
      <SectionCardHeader>
        <SectionLabel>Recent admin activity</SectionLabel>
        <Link href={ADMIN_PATHS.auditLog} className="text-xs font-medium hover:underline">
          View all
        </Link>
      </SectionCardHeader>
      {activity.length ? (
        <ul className="divide-y">
          {activity.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-0.5 px-5 py-3 text-sm">
              <p className="min-w-0 break-words">
                <span className="font-medium">{entry.actorName}</span>{" "}
                <span className="text-muted-foreground">
                  {ADMIN_AUDIT_ACTIONS[entry.action as AdminAuditAction] ?? entry.action}
                </span>{" "}
                <span className="font-medium">{entry.targetLabel}</span>
              </p>
              <p className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                <span className="font-mono">{formatDateTime(entry.createdAt)}</span>
                {entry.detail && <span className="min-w-0 truncate">{entry.detail}</span>}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <SectionEmpty icon={<IconHistory />}>No admin actions yet.</SectionEmpty>
      )}
    </Section>
  );
}
