import Link from "next/link";

import { SiteLogo } from "@/components/shared/site-header";
import { Separator } from "@/components/ui/separator";
import { COMPANY_NAME, COMPANY_URL } from "@/features/site-pages";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/support", label: "Support" },
      { href: "/status", label: "System status" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of service" },
      { href: "/cookies", label: "Cookie policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="space-y-3">
            <SiteLogo />
            <p className="max-w-xs text-sm text-muted-foreground">
              QR codes you can edit, track and brand — long after they&apos;re printed.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-3">
              <h3 className="text-sm font-medium">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; <CopyrightYear /> Dynamic QR Code Pro. All rights reserved.
          </p>
          <p>
            A product of{" "}
            <a
              href={COMPANY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {COMPANY_NAME}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// Cached so the footer can be prerendered; the year is filled in at build time.
async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
