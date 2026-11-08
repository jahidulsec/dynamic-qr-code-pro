import "server-only";

// Public, server-only API of the email feature. Import from "@/features/email/server" only.
export { sendEmailSchema, type SendEmailValues } from "./schemas/email";
export { sendEmail } from "./services/send-email";
export { invitationEmail } from "./templates/invitation";
export { passwordChangedEmail } from "./templates/password-changed";
export { resetPasswordLinkEmail } from "./templates/reset-password-link";
export { verificationLinkEmail } from "./templates/verification-link";
export { welcomeEmail } from "./templates/welcome";
