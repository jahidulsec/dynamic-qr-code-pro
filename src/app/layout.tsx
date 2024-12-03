import type { Metadata } from "next";
import "./globals.css";
import NextProgressProvider from "@/contexts/ProgressProvider";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "QR App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-inter antialiased`}>
        <NextProgressProvider>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </NextProgressProvider>
      </body>
    </html>
  );
}
