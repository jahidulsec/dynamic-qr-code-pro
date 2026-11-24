"use client";

import { useMemo, useSyncExternalStore } from "react";

import type { CookieConsent } from "@/features/site-pages/constants";
import { parseConsent, readConsentRaw, subscribeConsent } from "@/features/site-pages/libs/cookie-consent";

const UNKNOWN = "unknown";

/**
 * The visitor's saved cookie choice, kept in sync across components.
 * - `undefined`: not known yet (server render / before hydration)
 * - `null`: no choice saved
 */
export function useCookieConsent(): CookieConsent | null | undefined {
  const raw = useSyncExternalStore(subscribeConsent, readConsentRaw, () => UNKNOWN);
  return useMemo(() => (raw === UNKNOWN ? undefined : parseConsent(raw)), [raw]);
}
