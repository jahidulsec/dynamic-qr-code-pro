import { siteConfig } from "@/config/site";

import { emailLayout, escapeHtml } from "./layout";

export function welcomeEmail(name: string) {
  return {
    subject: `Welcome to ${siteConfig.name}`,
    text: `Hi ${name},\n\nYour email is verified and your account is ready. Start creating dynamic QR codes at ${siteConfig.url}`,
    html: emailLayout(`
      <p style="margin:0 0 16px;">Hi ${escapeHtml(name)},</p>
      <p style="margin:0 0 24px;">Your email is verified and your account is ready.</p>
      <a href="${siteConfig.url}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 20px;border-radius:6px;">Create your first QR code</a>
    `),
  };
}
