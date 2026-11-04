import { emailLayout } from "./layout";

export function verificationCodeEmail(otp: string) {
  return {
    subject: "Your verification code",
    text: `Your verification code is ${otp}. It expires in 5 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: emailLayout(`
      <p style="margin:0 0 16px;">Use this code to verify your email address:</p>
      <p style="margin:0 0 16px;font-size:32px;font-weight:bold;letter-spacing:8px;">${otp}</p>
      <p style="margin:0;color:#71717a;">It expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
    `),
    headers: {
      // unique per send so Gmail doesn't collapse resent codes into one thread
      "X-Entity-Ref-ID": crypto.randomUUID(),
      // mark as automated so mail servers skip out-of-office/auto replies
      "Auto-Submitted": "auto-generated",
      "X-Auto-Response-Suppress": "All",
      Importance: "high",
      "X-Priority": "1",
    },
  };
}
