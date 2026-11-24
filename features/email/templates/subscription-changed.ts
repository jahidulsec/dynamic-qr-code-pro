import { siteConfig } from "@/config/site";

import { emailLayout, escapeHtml } from "./layout";

type SubscriptionChangedEmail = {
  organizationName: string;
  organizationSlug: string;
  planName: string;
  /** already formatted, e.g. "Dec 24, 2026"; null = no end date */
  endsOn: string | null;
};

/** Sent to every owner when an admin moves the organization to another plan and ticks "Email owners". */
export function subscriptionChangedEmail({ organizationName, organizationSlug, planName, endsOn }: SubscriptionChangedEmail) {
  const url = `${siteConfig.url}/${encodeURIComponent(organizationSlug)}/settings/billing`;
  const period = endsOn ? `It runs until ${endsOn}.` : "It has no end date.";

  return {
    subject: `${organizationName}: your plan is now ${planName}`,
    text: `Your organization ${organizationName} is now on the ${planName} plan. ${period}\n\nSee your plan and usage here:\n\n${url}`,
    html: emailLayout(`
      <p style="margin:0 0 16px;">Your organization <strong>${escapeHtml(organizationName)}</strong> is now on the <strong>${escapeHtml(planName)}</strong> plan.</p>
      <p style="margin:0 0 24px;">${escapeHtml(period)}</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">View billing</a>
    `),
    headers: {
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
    },
  };
}
