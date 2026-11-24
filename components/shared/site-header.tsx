import Image from "next/image";
import Link from "next/link";
import React from "react";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
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

/** Header actions for signed-out visitors. */
export function GuestHeaderActions() {
  return (
    <>
      <Button variant="ghost" size="sm" className="rounded-full px-3" nativeButton={false} render={<Link href="/sign-in" />}>
        Sign in
      </Button>
      <Button size="sm" className="rounded-full px-3" nativeButton={false} render={<Link href="/sign-up" />}>
        Get started
      </Button>
    </>
  );
}

/** Header action for signed-in users. */
export function MemberHeaderActions() {
  return (
    <Button size="sm" className="rounded-full px-3" nativeButton={false} render={<Link href="/organizations" />}>
      Go to dashboard
    </Button>
  );
}

type SiteHeaderProps = {
  /** Right-hand actions. Defaults to the signed-out buttons. */
  actions?: React.ReactNode;
};

export function SiteHeader({ actions = <GuestHeaderActions /> }: SiteHeaderProps) {
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
          <ThemeToggle />
          {actions}
        </div>
      </div>
    </header>
  );
}
