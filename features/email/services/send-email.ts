import nodemailer, { type Transporter } from "nodemailer";

import { sendEmailSchema, type SendEmailValues } from "@/features/email/schemas/email";
import { env } from "@/lib/env";

// reuse one pooled transport across hot reloads in dev
const globalForMailer = globalThis as unknown as { mailer?: Transporter };

const mailer =
  globalForMailer.mailer ??
  nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
    pool: true,
  });

if (env.NODE_ENV !== "production") globalForMailer.mailer = mailer;

export async function sendEmail(values: SendEmailValues) {
  const { to, subject, text, html, replyTo, headers } = sendEmailSchema.parse(values);

  return mailer.sendMail({ from: env.EMAIL_FROM, to, subject, text, html, replyTo, headers });
}
