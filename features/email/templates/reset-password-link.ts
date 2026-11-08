import { emailLayout, escapeHtml } from "./layout";

export function resetPasswordLinkEmail(url: string) {
  const footer = "It expires in 1 hour. If you didn't request a password reset, ignore this email and your password won't change.";

  return {
    subject: "Reset your password",
    text: `Reset your password by opening this link:\n\n${url}\n\n${footer}`,
    html: emailLayout(`
      <p style="margin:0 0 24px;">Click the button below to choose a new password:</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">Reset password</a>
      <p style="margin:24px 0 8px;color:#71717a;">Or paste this link into your browser:</p>
      <p style="margin:0 0 16px;word-break:break-all;color:#71717a;">${escapeHtml(url)}</p>
      <p style="margin:0;color:#71717a;">${escapeHtml(footer)}</p>
    `),
    headers: {
      // unique per send so Gmail doesn't collapse repeated requests into one thread
      "X-Entity-Ref-ID": crypto.randomUUID(),
      // mark as automated so mail servers skip out-of-office/auto replies
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
      Importance: "high",
      "X-Priority": "1",
    },
  };
}
