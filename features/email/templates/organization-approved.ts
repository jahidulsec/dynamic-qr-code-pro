import { siteConfig } from "@/config/site";

import { emailLayout, escapeHtml } from "./layout";

type OrganizationApprovedEmail = {
  organizationName: string;
  organizationSlug: string;
  planName: string;
};

/** The activation email, sent to every owner when an admin approves the organization. */
export function organizationApprovedEmail({ organizationName, organizationSlug, planName }: OrganizationApprovedEmail) {
  const url = `${siteConfig.url}/${encodeURIComponent(organizationSlug)}`;

  return {
    subject: `${organizationName} is ready to use`,
    text: `Your organization ${organizationName} has been approved and is on the ${planName} plan.\n\nOpen it here:\n\n${url}`,
    html: emailLayout(`
      <p style="margin:0 0 16px;">Your organization <strong>${escapeHtml(organizationName)}</strong> has been approved.</p>
      <p style="margin:0 0 24px;">Plan: ${escapeHtml(planName)}</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">Open ${escapeHtml(organizationName)}</a>
    `),
    headers: {
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
    },
  };
}
