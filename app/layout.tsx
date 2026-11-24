import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { NavigationProgress } from "@/components/shared/nav-progressbar/progress-bar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/shared/theme-provider";

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcf9" },
    { media: "(prefers-color-scheme: dark)", color: "#090b12" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // next-themes sets the theme class on <html> before hydration
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        outfit.variable,
        spaceGroteskHeading.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        {/* reads usePathname(), which is runtime-only; outside Suspense it blocks prerendering */}
        <ThemeProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Toaster richColors position="top-right" closeButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
