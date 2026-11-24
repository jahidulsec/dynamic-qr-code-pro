/** Shown on the legal pages. Bump when the policy text changes. */
export const LEGAL_LAST_UPDATED = "November 24, 2026";

export const COMPANY_NAME = "Impala Intech Ltd.";
export const COMPANY_URL = "https://impalaintech.com/";

/** First-party cookie that stores the visitor's cookie choices. */
export const COOKIE_CONSENT_NAME = "cookie_consent";
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // one year

export const OPTIONAL_COOKIE_CATEGORIES = [
  {
    id: "analytics",
    label: "Analytics",
    description: "Help us understand how the site is used so we can improve it. Aggregated and never sold.",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Measure the reach of our campaigns and show relevant offers on other sites.",
  },
] as const;

export type OptionalCookieCategory = (typeof OPTIONAL_COOKIE_CATEGORIES)[number]["id"];
export type CookieConsent = Record<OptionalCookieCategory, boolean>;
