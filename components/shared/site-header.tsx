import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-heading text-base font-semibold tracking-tight">
      {/* Served from app/icon.svg, the same file used for the favicon */}
      <Image src="/icon.svg" alt="" width={32} height={32} unoptimized className="size-8" />
      Dynamic QR Pro
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <SiteLogo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="rounded-full px-3" nativeButton={false} render={<Link href="/sign-in" />}>
            Sign in
          </Button>
          <Button size="sm" className="rounded-full px-3" nativeButton={false} render={<Link href="/sign-up" />}>
            Get started
          </Button>
        </div>
      </div>
    </header>
  );
}
