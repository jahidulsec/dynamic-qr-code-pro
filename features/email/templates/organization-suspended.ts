import { siteConfig } from "@/config/site";

import { emailLayout, escapeHtml } from "./layout";

type OrganizationSuspendedEmail = {
  organizationName: string;
  reason: string;
};

/** Sent to every owner when an admin suspends the organization. */
export function organizationSuspendedEmail({ organizationName, reason }: OrganizationSuspendedEmail) {
  const notice = "Your QR codes have stopped redirecting.";
  const support = `Contact us at ${siteConfig.supportEmail} to restore access.`;

  return {
    subject: `${organizationName} has been suspended`,
    text: `Your organization ${organizationName} has been suspended.\n\nReason: ${reason}\n\n${notice}\n\n${support}`,
    html: emailLayout(`
      <p style="margin:0 0 16px;">Your organization <strong>${escapeHtml(organizationName)}</strong> has been suspended.</p>
      <p style="margin:0 0 16px;"><strong>Reason:</strong> ${escapeHtml(reason)}</p>
      <p style="margin:0 0 16px;">${escapeHtml(notice)}</p>
      <p style="margin:0;color:#71717a;">${escapeHtml(support)}</p>
    `),
    headers: {
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
      Importance: "high",
      "X-Priority": "1",
    },
  };
}
