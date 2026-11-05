import "server-only";

// Public, server-only API of the email feature. Import from "@/features/email/server" only.
export { sendEmailSchema, type SendEmailValues } from "./schemas/email";
export { sendEmail } from "./services/send-email";
export { verificationLinkEmail } from "./templates/verification-link";
export { welcomeEmail } from "./templates/welcome";
