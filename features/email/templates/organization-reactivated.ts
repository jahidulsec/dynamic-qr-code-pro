import { siteConfig } from "@/config/site";

import { emailLayout, escapeHtml } from "./layout";

type OrganizationReactivatedEmail = {
  organizationName: string;
  organizationSlug: string;
};

/** Sent to every owner when an admin lifts a suspension. */
export function organizationReactivatedEmail({ organizationName, organizationSlug }: OrganizationReactivatedEmail) {
  const url = `${siteConfig.url}/${encodeURIComponent(organizationSlug)}`;

  return {
    subject: `${organizationName} is active again`,
    text: `Your organization ${organizationName} is active again, and its QR codes are redirecting.\n\nOpen it here:\n\n${url}`,
    html: emailLayout(`
      <p style="margin:0 0 24px;">Your organization <strong>${escapeHtml(organizationName)}</strong> is active again, and its QR codes are redirecting.</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">Open ${escapeHtml(organizationName)}</a>
    `),
    headers: {
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
    },
  };
}
