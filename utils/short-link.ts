import { env } from "@/lib/env";

// server only: lib/env loads dotenv, so client components receive the base URL as a prop
export const getQrBaseUrl = () => (env.NEXT_PUBLIC_QR_BASE_URL ?? `${env.NEXT_PUBLIC_SITE_URL}/q`).replace(/\/+$/, "");
