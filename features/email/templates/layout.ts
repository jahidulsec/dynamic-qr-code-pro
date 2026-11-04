import { siteConfig } from "@/config/site";

const escapeMap: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => escapeMap[char]);
}

// table-based markup with inline styles so it renders in most email clients
export function emailLayout(content: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:8px;padding:32px;">
            <tr><td style="font-size:18px;font-weight:bold;padding-bottom:24px;">${siteConfig.name}</td></tr>
            <tr><td style="font-size:14px;line-height:22px;">${content}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
