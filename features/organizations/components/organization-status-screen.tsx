import Link from "next/link";
import { IconArrowLeft, IconBan, IconCircleX, IconClock } from "@tabler/icons-react";

import { SiteLogo } from "@/components/shared/site-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { WithdrawRequestButton } from "@/features/organizations/components/withdraw-request-button";
import { isOwnerRole } from "@/features/organizations/libs/roles";
import type { Access } from "@/features/organizations/services/get-membership";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/format";

type OrganizationStatusScreenProps = {
  /** a membership in an organization that isn't active */
  access: Pick<Access, "organization" | "member" | "session">;
};

const screens = {
  PENDING: { icon: IconClock, iconClassName: "bg-primary/10 text-primary", title: "Waiting for approval" },
  REJECTED: {
    icon: IconCircleX,
    iconClassName: "bg-destructive/10 text-destructive",
    title: "This organization wasn't approved",
  },
  SUSPENDED: {
    icon: IconBan,
    iconClassName: "bg-destructive/10 text-destructive",
    title: "This organization is suspended",
  },
} as const;

/** Shown in place of the app for every route under `/<slug>` while the organization isn't active. */
export function OrganizationStatusScreen({ access }: OrganizationStatusScreenProps) {
  const { organization, member, session } = access;
  const status = organization.status as keyof typeof screens;
  const screen = screens[status] ?? screens.SUSPENDED;
  const Icon = screen.icon;

  const isOwner = isOwnerRole(member.role);
  const canWithdraw = isOwner && (status === "PENDING" || status === "REJECTED");
  const reason = organization.statusReason as string | null | undefined;

  return (
    <div className="flex min-h-svh flex-col gap-4 p-6 md:p-10">
      <div className="flex justify-center md:justify-start">
        <SiteLogo />
      </div>
      <main className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="justify-items-center gap-3 text-center">
            <span className={cn("flex size-12 items-center justify-center rounded-full", screen.iconClassName)}>
              <Icon className="size-6" />
            </span>
            <p className="text-xs font-medium text-muted-foreground uppercase">{organization.name}</p>
            <CardTitle>
              <h1 className="font-heading text-xl font-semibold tracking-tight">{screen.title}</h1>
            </CardTitle>
            {status === "PENDING" && (
              <CardDescription className="text-balance">
                Submitted {formatDate(new Date(organization.createdAt))}. We&apos;ll email{" "}
                {isOwner ? <span className="font-medium">{session.user.email}</span> : "the organization's owners"}{" "}
                when it&apos;s approved.
              </CardDescription>
            )}
          </CardHeader>

          {(reason || status === "SUSPENDED") && (
            <CardContent className="flex flex-col gap-3 text-center">
              {reason && (
                <p className="rounded-lg bg-muted p-3 text-sm break-words text-muted-foreground">{reason}</p>
              )}
              {status === "SUSPENDED" && (
                <p className="text-sm text-muted-foreground">
                  Contact{" "}
                  <a href={`mailto:${siteConfig.supportEmail}`} className="font-medium text-foreground underline">
                    {siteConfig.supportEmail}
                  </a>{" "}
                  to restore access.
                </p>
              )}
            </CardContent>
          )}

          <CardFooter className="flex-col gap-2">
            <Link href="/organizations" className={buttonVariants({ variant: "outline", className: "w-full" })}>
              <IconArrowLeft />
              Back to organizations
            </Link>
            {canWithdraw && <WithdrawRequestButton organization={organization} redirectTo="/organizations" />}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
