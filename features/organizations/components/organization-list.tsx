import Link from "next/link";
import { redirect } from "next/navigation";
import { IconChevronRight, IconMail, IconPlus } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import {
  getSession,
  listOrganizations,
  listPendingInvitations,
} from "@/features/organizations/services/get-organization";

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

export async function OrganizationList() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const [organizations, invitations] = await Promise.all([listOrganizations(), listPendingInvitations()]);

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
      <PendingInvitations invitations={invitations} />
      <ul className="flex flex-col gap-2">
        {organizations.map((organization) => (
          <li key={organization.id}>
            <Link
              href={`/${organization.slug}`}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Avatar className="size-10 rounded-lg after:rounded-lg">
                <AvatarImage src={organization.logo ?? undefined} alt="" className="rounded-lg" />
                <AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
                  {organization.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight">
                <span className="truncate font-medium">{organization.name}</span>
                <span className="truncate text-xs text-muted-foreground">/{organization.slug}</span>
              </div>
              <IconChevronRight className="size-4 text-muted-foreground" />
            </Link>
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
