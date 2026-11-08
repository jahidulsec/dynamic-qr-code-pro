import Link from "next/link";

import { brandConfig } from "@/config/brand";
import { FOOTER_LINKS } from "@/features/dashboard/constants";

export function DashboardFooter() {
  return (
    <footer className="mt-auto border-t px-4 py-3">
      <nav
        aria-label="Footer"
        className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm"
      >
        {FOOTER_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="border-r pr-4 last-of-type:border-r-0 last-of-type:pr-0 hover:underline"
          >
            {label}
          </Link>
        ))}
        <span className="text-muted-foreground">
          © {new Date().getFullYear()} {brandConfig.name}. Built by{" "}
          <a
            href="https://impalaintech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            Impala Intech Ltd.
          </a>
        </span>
      </nav>
    </footer>
  );
}
