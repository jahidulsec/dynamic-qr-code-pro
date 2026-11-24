"use client";

import { IconCookie } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/features/site-pages/hooks/use-cookie-consent";
import { ALL_CONSENT, DEFAULT_CONSENT, writeConsent } from "@/features/site-pages/libs/cookie-consent";

/**
 * Disables an auth form until the visitor has made a cookie choice.
 *
 * Sign-in relies on a strictly necessary session cookie, so either choice unlocks the form —
 * optional cookies are never required to sign in (no cookie wall).
 */
export function CookieConsentGate({ children }: React.PropsWithChildren) {
  const consent = useCookieConsent();
  const blocked = consent === null;

  return (
    <div className="flex flex-col gap-6">
      {blocked && (
        <section
          aria-label="Cookies required"
          className="rounded-xl border bg-muted/40 p-4 text-sm duration-200 animate-in fade-in-0"
        >
          <div className="flex gap-3">
            <IconCookie className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="font-medium">Accept cookies to continue</p>
                <p className="text-muted-foreground">
                  We use a necessary cookie to keep you signed in securely.{" "}
                  <Link href="/cookies" className="font-medium text-foreground underline underline-offset-4">
                    Learn more
                  </Link>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => writeConsent(DEFAULT_CONSENT)}>
                  Accept necessary
                </Button>
                <Button size="sm" variant="outline" onClick={() => writeConsent(ALL_CONSENT)}>
                  Accept all
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* a disabled fieldset disables every input and button inside the form */}
      <fieldset disabled={blocked} aria-disabled={blocked} className="contents">
        {children}
      </fieldset>
    </div>
  );
}
