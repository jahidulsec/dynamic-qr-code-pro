import { emailLayout, escapeHtml } from "./layout";

export function verificationLinkEmail(url: string) {
  return {
    subject: "Verify your email address",
    text: `Verify your email address by opening this link:\n\n${url}\n\nIt expires in 1 hour. If you didn't request this, you can ignore this email.`,
    html: emailLayout(`
      <p style="margin:0 0 24px;">Click the button below to verify your email address:</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">Verify email</a>
      <p style="margin:24px 0 8px;color:#71717a;">Or paste this link into your browser:</p>
      <p style="margin:0 0 16px;word-break:break-all;color:#71717a;">${escapeHtml(url)}</p>
      <p style="margin:0;color:#71717a;">It expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `),
    headers: {
      // unique per send so Gmail doesn't collapse resent links into one thread
      "X-Entity-Ref-ID": crypto.randomUUID(),
      // mark as automated so mail servers skip out-of-office/auto replies
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
      Importance: "high",
      "X-Priority": "1",
    },
  };
}
