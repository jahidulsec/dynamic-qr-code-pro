import Link from "next/link";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { IconMailOff } from "@tabler/icons-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InvitationResponse } from "@/features/organizations/components/invitation-response";
import { RoleBadge } from "@/features/organizations/components/role-badge";
import { getSession } from "@/features/organizations/services/get-organization";
import { auth } from "@/lib/auth/auth";

function Heading({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-balance text-muted-foreground">{description}</p>
    </div>
  );
}

// null when the invitation can't be shown to this user; only better-auth's own rejections are swallowed
async function findInvitation(id: string) {
  try {
    return await auth.api.getInvitation({ query: { id }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) return null;
    throw error;
  }
}

export async function AcceptInvitation({ invitationId }: { invitationId: Promise<string> }) {
  const [id, session] = await Promise.all([invitationId, getSession()]);

  // invitation details need a session; the user comes back here from /organizations once signed in
  if (!session) {
    return (
      <div className="flex flex-col gap-6">
        <Heading
          title="You've been invited"
          description="Sign in or create an account with the email address the invitation was sent to."
        />
        <div className="flex flex-col gap-2">
          <Link href="/sign-in" className={buttonVariants()}>
            Sign in
          </Link>
          <Link href="/sign-up" className={buttonVariants({ variant: "outline" })}>
            Create account
          </Link>
        </div>
      </div>
    );
  }

  const invitation = await findInvitation(id);

  if (!invitation) {
    return (
      <div className="flex flex-col items-center gap-6">
        <IconMailOff className="size-10 text-muted-foreground" />
        <Heading
          title="Invitation unavailable"
          description={
            <>
              It may have expired, been canceled or already used, or it was sent to a different address than{" "}
              <span className="font-medium text-foreground">{session.user.email}</span>. Ask for a new invitation.
            </>
          }
        />
        <Link href="/organizations" className={buttonVariants({ variant: "outline" })}>
          Go to your organizations
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading
        title={`Join ${invitation.organizationName}`}
        description={
          <>
            <span className="font-medium text-foreground">{invitation.inviterEmail}</span> invited you to collaborate
            on its QR codes.
          </>
        }
      />

      <div className="flex items-center gap-3 rounded-lg border p-3">
        <Avatar className="size-10 rounded-lg after:rounded-lg">
          <AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            {invitation.organizationName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-sm leading-tight">
          <span className="truncate font-medium">{invitation.organizationName}</span>
          <span className="truncate text-xs text-muted-foreground">/{invitation.organizationSlug}</span>
        </div>
        <RoleBadge role={invitation.role} />
      </div>

      <InvitationResponse invitationId={invitation.id} />
    </div>
  );
}

export function AcceptInvitationSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="mx-auto h-14 w-64" />
      <Skeleton className="h-[66px] rounded-lg" />
      <Skeleton className="h-20" />
    </div>
  );
}
