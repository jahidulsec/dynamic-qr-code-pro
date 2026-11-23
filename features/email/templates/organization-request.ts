import { siteConfig } from "@/config/site";

import { emailLayout, escapeHtml } from "./layout";

type OrganizationRequestEmail = {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  requesterName: string;
  requesterEmail: string;
};

/** Sent to `ADMIN_NOTIFY_EMAILS` when someone creates an organization that needs review. */
export function organizationRequestEmail({
  organizationId,
  organizationName,
  organizationSlug,
  requesterName,
  requesterEmail,
}: OrganizationRequestEmail) {
  const url = `${siteConfig.url}/admin/organizations/${encodeURIComponent(organizationId)}`;
  const requester = `${requesterName} (${requesterEmail})`;

  return {
    subject: `New organization request: ${organizationName}`,
    text: `${requester} requested a new organization.\n\nName: ${organizationName}\nURL: /${organizationSlug}\n\nReview the request:\n\n${url}`,
    html: emailLayout(`
      <p style="margin:0 0 16px;">${escapeHtml(requester)} requested a new organization.</p>
      <p style="margin:0 0 4px;"><strong>Name:</strong> ${escapeHtml(organizationName)}</p>
      <p style="margin:0 0 24px;"><strong>URL:</strong> /${escapeHtml(organizationSlug)}</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">Review request</a>
    `),
    headers: {
      // unique per send so Gmail doesn't collapse separate requests into one thread
      "X-Entity-Ref-ID": crypto.randomUUID(),
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
    },
  };
}
