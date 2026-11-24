import { COOKIE_CONSENT_MAX_AGE, COOKIE_CONSENT_NAME, type CookieConsent } from "@/features/site-pages/constants";

// Browser-only helpers: call from event handlers, effects or useSyncExternalStore, never during server render.

export const DEFAULT_CONSENT: CookieConsent = { analytics: false, marketing: false };
export const ALL_CONSENT: CookieConsent = { analytics: true, marketing: true };

const CHANGE_EVENT = "cookie-consent-change";

/** Raw cookie value (a stable string, safe as a useSyncExternalStore snapshot), or `null` if unset. */
export function readConsentRaw(): string | null {
  return (
    document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${COOKIE_CONSENT_NAME}=`))
      ?.slice(COOKIE_CONSENT_NAME.length + 1) ?? null
  );
}

/** Parses a raw cookie value; `null` means the visitor hasn't chosen yet. */
export function parseConsent(raw: string | null): CookieConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<CookieConsent>;
    return { analytics: parsed.analytics === true, marketing: parsed.marketing === true };
  } catch {
    return null;
  }
}

export function writeConsent(consent: CookieConsent) {
  const value = encodeURIComponent(JSON.stringify(consent));
  document.cookie = `${COOKIE_CONSENT_NAME}=${value}; path=/; max-age=${COOKIE_CONSENT_MAX_AGE}; samesite=lax`;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeConsent(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}
