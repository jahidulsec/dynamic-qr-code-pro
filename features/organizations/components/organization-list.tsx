import Link from "next/link";
import { redirect } from "next/navigation";
import { IconChevronRight, IconCircleCheck, IconMail, IconPlus } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import { WithdrawRequestButton } from "@/features/organizations/components/withdraw-request-button";
import { isOwnerRole } from "@/features/organizations/libs/roles";
import {
  getSession,
  listOrganizations,
  listPendingInvitations,
} from "@/features/organizations/services/get-organization";
import { getMembers } from "@/features/organizations/services/member";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/utils/format";

type PendingInvitation = Awaited<ReturnType<typeof listPendingInvitations>>[number];

function PendingInvitations({ invitations }: { invitations: PendingInvitation[] }) {
  if (!invitations.length) return null;

  return (
    <section className="flex flex-col gap-2" aria-label="Pending invitations">
      <p className="text-xs font-medium text-muted-foreground uppercase">Invitations</p>
      <ul className="flex flex-col gap-2">
        {invitations.map((invitation) => (
          <li key={invitation.id}>
            <Link
              href={`/accept-invitation/${invitation.id}`}
              className="flex items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconMail className="size-5" />
              </span>
              <div className="grid flex-1 text-sm leading-tight">
                <span className="truncate font-medium">{invitation.organizationName ?? "An organization"}</span>
                <span className="truncate text-xs text-muted-foreground">Review invitation</span>
              </div>
              <RoleBadge role={invitation.role} />
              <IconChevronRight className="size-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

type ListedOrganization = Awaited<ReturnType<typeof listOrganizations>>[number];

const rowClassName = "flex items-center gap-3 rounded-lg border p-3";

function OrganizationAvatar({ organization, muted }: { organization: ListedOrganization; muted?: boolean }) {
  return (
    <Avatar className={cn("size-10 rounded-lg after:rounded-lg", muted && "opacity-60")}>
      <AvatarImage src={organization.logo ?? undefined} alt="" className="rounded-lg" />
      <AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
        {organization.name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function OrganizationRow({ organization, isOwner }: { organization: ListedOrganization; isOwner: boolean }) {
  switch (organization.status) {
    // waiting for review: not a link, so it can't be focused or opened
    case "PENDING":
      return (
        <div aria-disabled="true" className={cn(rowClassName, "bg-muted/40 text-muted-foreground")}>
          <OrganizationAvatar organization={organization} muted />
          <div className="grid flex-1 text-sm leading-tight">
            <span className="truncate font-medium">{organization.name}</span>
            <span className="truncate text-xs">Submitted {formatRelativeDate(new Date(organization.createdAt))}</span>
          </div>
          <Badge variant="secondary">Pending approval</Badge>
        </div>
      );

    case "REJECTED":
      return (
        <div aria-disabled="true" className={cn(rowClassName, "flex-wrap")}>
          <OrganizationAvatar organization={organization} muted />
          <div className="grid min-w-0 flex-1 text-sm leading-tight">
            <span className="truncate font-medium text-muted-foreground">{organization.name}</span>
            {organization.statusReason && (
              <span className="text-xs break-words text-muted-foreground">{organization.statusReason}</span>
            )}
          </div>
          <Badge variant="destructive">Not approved</Badge>
          {isOwner && <WithdrawRequestButton organization={organization} />}
        </div>
      );

    // ACTIVE, and SUSPENDED, whose link opens the suspended screen
    default:
      return (
        <Link
          href={`/${organization.slug}`}
          className={cn(
            rowClassName,
            "transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          )}
        >
          <OrganizationAvatar organization={organization} />
          <div className="grid flex-1 text-sm leading-tight">
            <span className="truncate font-medium">{organization.name}</span>
            <span className="truncate text-xs text-muted-foreground">/{organization.slug}</span>
          </div>
          {organization.status === "SUSPENDED" && <Badge variant="destructive">Suspended</Badge>}
          <IconChevronRight className="size-4 text-muted-foreground" />
        </Link>
      );
  }
}

// owners may withdraw a rejected request; read fresh, and only when there's a rejected row to decide for
async function listOwnedOrganizationIds(userId: string, organizations: ListedOrganization[]) {
  const rejected = organizations.filter((organization) => organization.status === "REJECTED").map(({ id }) => id);
  if (!rejected.length) return new Set<string>();

  const members = await getMembers(
    { where: { userId, organizationId: { in: rejected } }, select: { organizationId: true, role: true } },
    { cache: false },
  );
  return new Set(members.filter((member) => isOwnerRole(member.role)).map((member) => member.organizationId));
}

type OrganizationListProps = {
  /** slug from `?requested=`, set after a create; the notice shows only for one of the user's organizations */
  requested?: string;
};

export async function OrganizationList({ requested }: OrganizationListProps = {}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  // status comes back from better-auth as an additional field, read from the database on every request
  const [organizations, invitations] = await Promise.all([listOrganizations(), listPendingInvitations()]);
  const ownedIds = await listOwnedOrganizationIds(session.user.id, organizations);
  const requestedOrganization = requested
    ? organizations.find((organization) => organization.slug === requested)
    : undefined;

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <PendingInvitations invitations={invitations} />
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground">
            {invitations.length
              ? "Accept an invitation above, or start your own workspace."
              : "You aren't a member of any organization yet."}
          </p>
          <Link href="/organizations/new" className={buttonVariants()}>
            <IconPlus />
            Create organization
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {requestedOrganization && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm"
        >
          <IconCircleCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            <span className="font-medium">{requestedOrganization.name}</span> has been submitted for review.
            We&apos;ll email you when it&apos;s approved.
          </p>
        </div>
      )}
      <PendingInvitations invitations={invitations} />
      <ul className="flex flex-col gap-2">
        {organizations.map((organization) => (
          <li key={organization.id}>
            <OrganizationRow organization={organization} isOwner={ownedIds.has(organization.id)} />
          </li>
        ))}
      </ul>
      <Link href="/organizations/new" className={buttonVariants({ variant: "outline" })}>
        <IconPlus />
        Create new organization
      </Link>
    </div>
  );
}

export function OrganizationListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-[66px] rounded-lg" />
      ))}
    </div>
  );
}
