import "server-only";

// Public, server-only API of the email feature. Import from "@/features/email/server" only.
export { sendEmailSchema, type SendEmailValues } from "./schemas/email";
export { sendEmail } from "./services/send-email";
export { sendToOwners } from "./services/send-to-owners";
export { invitationEmail } from "./templates/invitation";
export { organizationApprovedEmail } from "./templates/organization-approved";
export { organizationReactivatedEmail } from "./templates/organization-reactivated";
export { organizationRejectedEmail } from "./templates/organization-rejected";
export { organizationRequestEmail } from "./templates/organization-request";
export { organizationSuspendedEmail } from "./templates/organization-suspended";
export { passwordChangedEmail } from "./templates/password-changed";
export { resetPasswordLinkEmail } from "./templates/reset-password-link";
export { verificationLinkEmail } from "./templates/verification-link";
export { welcomeEmail } from "./templates/welcome";
