import { emailLayout, escapeHtml } from "./layout";

type InvitationEmail = {
  url: string;
  organizationName: string;
  inviterName: string;
  role: string;
  /** keep in sync with the organization plugin's invitationExpiresIn */
  expiresInHours: number;
};

export function invitationEmail({ url, organizationName, inviterName, role, expiresInHours }: InvitationEmail) {
  const intro = `${inviterName} invited you to join ${organizationName} as ${/^[aeiou]/i.test(role) ? "an" : "a"} ${role}.`;
  const expiry = `The invitation expires in ${expiresInHours} hours. If you weren't expecting it, you can ignore this email.`;

  return {
    subject: `Join ${organizationName}`,
    text: `${intro}\n\nAccept the invitation by opening this link:\n\n${url}\n\n${expiry}`,
    html: emailLayout(`
      <p style="margin:0 0 24px;">${escapeHtml(intro)}</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">Accept invitation</a>
      <p style="margin:24px 0 8px;color:#71717a;">Or paste this link into your browser:</p>
      <p style="margin:0 0 16px;word-break:break-all;color:#71717a;">${escapeHtml(url)}</p>
      <p style="margin:0;color:#71717a;">${escapeHtml(expiry)}</p>
    `),
    headers: {
      // unique per send so Gmail doesn't collapse resent invitations into one thread
      "X-Entity-Ref-ID": crypto.randomUUID(),
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
    },
  };
}
