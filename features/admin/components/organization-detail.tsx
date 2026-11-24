import { IconHistory, IconUsers } from "@tabler/icons-react";

import {
  Section,
  SectionCardHeader,
  SectionEmpty,
  SectionHeadingWithBackbutton,
  SectionLabel,
  SectionMeta,
} from "@/components/shared/section/section";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrganizationReviewActions } from "@/features/admin/components/organization-review-actions";
import { OrganizationStatusBadge, PlanStateBadge } from "@/features/admin/components/organization-status-badge";
import { ADMIN_PATHS } from "@/features/admin/constants";
import { ADMIN_AUDIT_ACTIONS, type AdminAuditAction } from "@/features/admin/libs/admin-audit-actions";
import type { getAdminOrganization } from "@/features/admin/libs/admin-organizations";
import { UsageBar } from "@/features/billing";
import { formatDate } from "@/utils/format";

export type AdminOrganizationDetailData = NonNullable<Awaited<ReturnType<typeof getAdminOrganization>>["data"]>;

const INTERVAL_LABELS = { MONTH: "Monthly", YEAR: "Yearly", NONE: "No billing interval" } as const;

const plural = (count: number, word: string) => `${count.toLocaleString()} ${word}${count === 1 ? "" : "s"}`;

// renders on the server only: dates are formatted in the server's time zone
const formatDateTime = (date: Date) =>
  `${formatDate(date)}, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

/** /admin/organizations/[id] (spec 04): header, status, subscription, usage, members and history. */
export function AdminOrganizationDetail({ data }: { data: AdminOrganizationDetailData }) {
  const { organization, members, entitlements, usage, plans, history } = data;

  return (
    <>
      <div className="flex flex-col gap-4 pt-2 pb-1 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeadingWithBackbutton
          href={ADMIN_PATHS.organizations}
          heading={organization.name}
          description={
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-mono">/{organization.slug}</span>
              <OrganizationStatusBadge status={organization.status} />
              <span>Created {formatDate(organization.createdAt)}</span>
            </span>
          }
        />
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <OrganizationReviewActions
            organization={{ id: organization.id, name: organization.name, status: organization.status }}
            plans={plans}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusSection organization={organization} />
        <SubscriptionSection organization={organization} entitlements={entitlements} />
      </div>

      <UsageSection usage={usage} entitlements={entitlements} />
      <MembersSection members={members} />
      <HistorySection history={history} />
    </>
  );
}

function DetailList({ items }: { items: [label: string, value: React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)] gap-x-4 gap-y-3 p-5 text-sm">
      {items.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="min-w-0 break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const muted = (text: string) => <span className="text-muted-foreground">{text}</span>;

function StatusSection({ organization }: { organization: AdminOrganizationDetailData["organization"] }) {
  return (
    <Section>
      <SectionCardHeader>
        <SectionLabel>Status</SectionLabel>
        <OrganizationStatusBadge status={organization.status} />
      </SectionCardHeader>
      <DetailList
        items={[
          ["Reason", organization.statusReason ? <span className="whitespace-pre-line">{organization.statusReason}</span> : muted("—")],
          [
            "Reviewed by",
            organization.reviewedBy ? (
              <>
                {organization.reviewedBy.name}
                <div className="text-xs text-muted-foreground">{organization.reviewedBy.email}</div>
              </>
            ) : (
              muted(organization.reviewedAt ? "Deleted admin" : "Not reviewed yet")
            ),
          ],
          ["Reviewed", organization.reviewedAt ? formatDateTime(organization.reviewedAt) : muted("—")],
        ]}
      />
    </Section>
  );
}

function SubscriptionSection({
  organization,
  entitlements,
}: {
  organization: AdminOrganizationDetailData["organization"];
  entitlements: AdminOrganizationDetailData["entitlements"];
}) {
  const { subscription } = organization;

  return (
    <Section>
      <SectionCardHeader>
        <SectionLabel>Subscription</SectionLabel>
        <PlanStateBadge state={entitlements.state} />
      </SectionCardHeader>
      {subscription ? (
        <DetailList
          items={[
            [
              "Plan",
              <>
                {subscription.plan.name}
                {subscription.plan.archivedAt && (
                  <Badge variant="ghost" className="ml-2">
                    Archived
                  </Badge>
                )}
                {entitlements.plan.id !== subscription.plan.id && (
                  <div className="text-xs text-muted-foreground">{entitlements.plan.name} limits apply</div>
                )}
              </>,
            ],
            ["Interval", INTERVAL_LABELS[subscription.interval]],
            ["Period start", formatDate(subscription.currentPeriodStart)],
            ["Period end", subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : muted("No end date")],
            ...(subscription.canceledAt ? [["Canceled", formatDate(subscription.canceledAt)] as [string, React.ReactNode]] : []),
            ["Provider", <span key="provider" className="font-mono">{subscription.provider}</span>],
            ["Notes", subscription.notes ? <span className="whitespace-pre-line">{subscription.notes}</span> : muted("—")],
          ]}
        />
      ) : (
        <DetailList
          items={[
            ["Plan", <>{entitlements.plan.name} <span className="text-muted-foreground">(default)</span></>],
            ["Subscription", muted("None. The default plan applies.")],
          ]}
        />
      )}
    </Section>
  );
}

function UsageSection({
  usage,
  entitlements,
}: {
  usage: AdminOrganizationDetailData["usage"];
  entitlements: AdminOrganizationDetailData["entitlements"];
}) {
  const { limits } = entitlements;

  return (
    <Section>
      <SectionCardHeader>
        <SectionLabel>Usage</SectionLabel>
        <SectionMeta>Against {entitlements.plan.name} limits</SectionMeta>
      </SectionCardHeader>
      <div className="grid gap-5 p-5 md:grid-cols-2">
        <UsageBar
          label="QR codes"
          used={usage.qrCodes}
          limit={limits.qrCodes}
          hint={`Outside the trash · ${plural(usage.trashedQrCodes, "code")} in the trash`}
        />
        <UsageBar
          label="Members"
          used={usage.members + usage.pendingInvitations}
          limit={limits.members}
          hint={`${plural(usage.members, "member")} · ${plural(usage.pendingInvitations, "pending invitation")}`}
        />
        <UsageBar label="Custom roles" used={usage.customRoles} limit={limits.customRoles} />
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-medium">Scans</span>
            <span className="ml-auto font-mono text-sm text-muted-foreground tabular-nums">
              {usage.scans.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Last 30 days · not limited by plan</p>
        </div>
      </div>
    </Section>
  );
}

function MembersSection({ members }: { members: AdminOrganizationDetailData["members"] }) {
  return (
    <Section className="overflow-hidden">
      <SectionCardHeader>
        <div className="flex items-center gap-3">
          <SectionLabel>Owners and members</SectionLabel>
          <SectionMeta>{members.length}</SectionMeta>
        </div>
      </SectionCardHeader>
      {members.length ? (
        <Table className="[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
          <TableHeader>
            <TableRow className="text-xs uppercase">
              <TableHead className="pl-4">Member</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="pr-4">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="max-w-72 pl-4">
                  <div className="truncate font-medium">{member.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {member.roles.map((role) => (
                      <Badge key={role} variant={role === "owner" ? "secondary" : "outline"}>
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="pr-4 font-mono text-xs text-muted-foreground">{formatDate(member.joinedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <SectionEmpty icon={<IconUsers />}>No members.</SectionEmpty>
      )}
    </Section>
  );
}

function HistorySection({ history }: { history: AdminOrganizationDetailData["history"] }) {
  return (
    <Section className="overflow-hidden">
      <SectionCardHeader>
        <div className="flex items-center gap-3">
          <SectionLabel>History</SectionLabel>
          <SectionMeta>{history.length}</SectionMeta>
        </div>
        <SectionMeta>Admin actions on this organization</SectionMeta>
      </SectionCardHeader>
      {history.length ? (
        <Table>
          <TableHeader>
            <TableRow className="text-xs uppercase">
              <TableHead className="pl-4">Change</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="pr-4 text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="pl-4 whitespace-nowrap">
                  <span className="font-medium">{entry.actorName}</span>{" "}
                  <span className="text-muted-foreground">
                    {ADMIN_AUDIT_ACTIONS[entry.action as AdminAuditAction] ?? entry.action}
                  </span>{" "}
                  <span className="font-medium">{entry.targetLabel}</span>
                </TableCell>
                <TableCell className="max-w-96 truncate text-xs text-muted-foreground" title={entry.detail ?? undefined}>
                  {entry.detail ?? "—"}
                </TableCell>
                <TableCell className="pr-4 text-right font-mono text-xs whitespace-nowrap text-muted-foreground">
                  {formatDateTime(entry.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <SectionEmpty icon={<IconHistory />}>No admin actions yet.</SectionEmpty>
      )}
    </Section>
  );
}
