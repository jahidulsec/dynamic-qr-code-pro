"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CookieCategoryList } from "@/features/site-pages/components/cookie-category-list";
import type { CookieConsent } from "@/features/site-pages/constants";
import { useCookieConsent } from "@/features/site-pages/hooks/use-cookie-consent";
import { ALL_CONSENT, DEFAULT_CONSENT, writeConsent } from "@/features/site-pages/libs/cookie-consent";

/**
 * Cookie consent banner for visitors who haven't chosen yet.
 *
 * - Non-blocking: a card pinned to the bottom of the viewport, no backdrop, page stays usable.
 * - "Reject all" and "Accept all" have equal weight, so declining is as easy as accepting.
 * - "Customize" opens a dismissible preferences dialog with per-category toggles.
 */
export function CookieConsentBanner() {
  const saved = useCookieConsent();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);

  const save = (next: CookieConsent) => {
    writeConsent(next);
    setPreferencesOpen(false);
  };

  // undefined = not known until hydration; only show once we know nothing is saved
  if (saved !== null) return null;

  return (
    <>
      <section
        aria-label="Cookie consent"
        className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-3xl rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur-sm duration-300 animate-in fade-in-0 slide-in-from-bottom-4 sm:p-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
          <p className="flex-1 text-sm text-muted-foreground">
            We use necessary cookies to keep the site working. With your consent, we&apos;d also use optional cookies
            to understand how it&apos;s used.{" "}
            <Link href="/cookies" className="font-medium text-foreground underline underline-offset-4">
              Cookie policy
            </Link>
          </p>
          <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => setPreferencesOpen(true)}>
              Customize
            </Button>
            <Button variant="outline" onClick={() => save(DEFAULT_CONSENT)}>
              Reject all
            </Button>
            <Button variant="outline" onClick={() => save(ALL_CONSENT)}>
              Accept all
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cookie preferences</DialogTitle>
            <DialogDescription>
              Necessary cookies are always on. Choose which optional cookies we may use — you can change this any
              time on the{" "}
              <Link href="/cookies" className="font-medium text-foreground underline underline-offset-4">
                cookie preferences
              </Link>{" "}
              page.
            </DialogDescription>
          </DialogHeader>

          <CookieCategoryList value={consent} onChange={setConsent} />

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => save(DEFAULT_CONSENT)}>
              Reject all
            </Button>
            <Button onClick={() => save(consent)}>Save preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
