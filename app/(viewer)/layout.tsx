import React, { Suspense } from "react";

import { SiteFooter } from "@/components/shared/site-footer";
import { GuestHeaderActions, MemberHeaderActions, SiteHeader } from "@/components/shared/site-header";
import { getSession } from "@/features/organizations/server";

// Reads the session cookie, so it streams in after the static shell.
async function HeaderActions() {
  const session = await getSession();
  return session ? <MemberHeaderActions /> : <GuestHeaderActions />;
}

export default function ViewLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader
        actions={
          // empty placeholder rather than "Sign in", so signed-in users never see the wrong button flash
          <Suspense fallback={<span className="h-8 w-40" aria-hidden />}>
            <HeaderActions />
          </Suspense>
        }
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
