import Link from "next/link";
import { redirect } from "next/navigation";
import { IconChevronRight, IconPlus } from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession, listOrganizations } from "@/features/organizations/services/get-organization";

export async function OrganizationList() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const organizations = await listOrganizations();

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">You aren&apos;t a member of any organization yet.</p>
        <Link href="/organizations/new" className={buttonVariants()}>
          <IconPlus />
          Create organization
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
