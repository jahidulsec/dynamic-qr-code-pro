import { siteConfig } from "@/config/site";

import { emailLayout, escapeHtml } from "./layout";

export function passwordChangedEmail(name: string) {
  const warning = `If you didn't do this, reset your password right away at ${siteConfig.url}/forgot-password and contact support.`;

  return {
    subject: "Your password was changed",
    text: `Hi ${name},\n\nThe password for your ${siteConfig.name} account was just reset, and every device was signed out.\n\n${warning}`,
    html: emailLayout(`
      <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 16px;">The password for your ${escapeHtml(siteConfig.name)} account was just reset, and every device was signed out.</p>
      <p style="margin:0;color:#71717a;">${escapeHtml(warning)}</p>
    `),
    headers: {
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
    },
  };
}
