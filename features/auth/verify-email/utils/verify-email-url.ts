// the verification link returns here, and Better Auth appends `error` when the link is invalid or expired
export const verifyEmailURL = (email: string) => `/verify-email?email=${encodeURIComponent(email)}`;
