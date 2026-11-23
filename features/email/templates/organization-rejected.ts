import { siteConfig } from "@/config/site";

import { emailLayout, escapeHtml } from "./layout";

type OrganizationRejectedEmail = {
  organizationName: string;
  reason: string;
};

/** Sent to every owner when an admin rejects the organization request. */
export function organizationRejectedEmail({ organizationName, reason }: OrganizationRejectedEmail) {
  const url = `${siteConfig.url}/organizations`;
  const support = `If you have questions, contact us at ${siteConfig.supportEmail}.`;

  return {
    subject: `Your request for ${organizationName} wasn't approved`,
    text: `Your request for the organization ${organizationName} wasn't approved.\n\nReason: ${reason}\n\n${support}\n\nView your request:\n\n${url}`,
    html: emailLayout(`
      <p style="margin:0 0 16px;">Your request for the organization <strong>${escapeHtml(organizationName)}</strong> wasn't approved.</p>
      <p style="margin:0 0 16px;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>
      <p style="margin:0 0 24px;color:#71717a;">${escapeHtml(support)}</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">View request</a>
    `),
    headers: {
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
    },
  };
}
