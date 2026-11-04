import Link from "next/link";

import { SiteLogo } from "@/components/shared/site-header";
import { Separator } from "@/components/ui/separator";

const footerColumns = [
  {
    title: "Product",
    links: [
      { href: "#features", label: "Features" },
      { href: "#pricing", label: "Pricing" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
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

        <p className="text-sm text-muted-foreground">
          &copy; <CopyrightYear /> Dynamic QR Code Pro. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// Cached so the footer can be prerendered; the year is filled in at build time.
async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
