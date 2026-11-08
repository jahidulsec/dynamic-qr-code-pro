import { Suspense } from "react";
import type { Metadata } from "next";

import { AcceptInvitation, AcceptInvitationSkeleton } from "@/features/organizations/server";

export const metadata: Metadata = {
  title: "Accept invitation",
  robots: { index: false },
};

export default function AcceptInvitationPage({ params }: PageProps<"/accept-invitation/[id]">) {
  return (
    // reads the session and the invitation, so it streams in behind the boundary
    <Suspense fallback={<AcceptInvitationSkeleton />}>
      <AcceptInvitation invitationId={params.then(({ id }) => id)} />
    </Suspense>
  );
}
