import LoginForm from "@/components/login/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Dynamic QR Code Pro",
};

export default async function AdminLogin() {
  return <LoginForm />;
}
