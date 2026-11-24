"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CookieCategoryList } from "@/features/site-pages/components/cookie-category-list";
import type { CookieConsent } from "@/features/site-pages/constants";
import { useCookieConsent } from "@/features/site-pages/hooks/use-cookie-consent";
import { ALL_CONSENT, DEFAULT_CONSENT, writeConsent } from "@/features/site-pages/libs/cookie-consent";

export function CookiePreferencesForm() {
  const saved = useCookieConsent();
  // unsaved edits; falls back to the saved choice until the visitor changes something
  const [draft, setDraft] = useState<CookieConsent | null>(null);
  const consent = draft ?? saved ?? DEFAULT_CONSENT;

  const save = (next: CookieConsent) => {
    setDraft(null);
    writeConsent(next);
    toast.success("Cookie preferences saved");
  };

  return (
    <div className="space-y-6">
      <CookieCategoryList value={consent} onChange={setDraft} />
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => save(consent)}>Save preferences</Button>
        <Button variant="outline" onClick={() => save(ALL_CONSENT)}>
          Accept all
        </Button>
        <Button variant="ghost" onClick={() => save(DEFAULT_CONSENT)}>
          Reject optional
        </Button>
      </div>
    </div>
  );
}
