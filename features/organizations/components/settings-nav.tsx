"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBuilding, IconShieldLock, IconUsers } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

const TABS = [
  { segment: "general", label: "General", icon: <IconBuilding /> },
  { segment: "members", label: "Members", icon: <IconUsers /> },
  { segment: "roles", label: "Roles", icon: <IconShieldLock /> },
] as const;

export function SettingsNav({ organizationSlug, memberCount }: { organizationSlug: string; memberCount: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings" className="-mx-4 overflow-x-auto border-b px-4">
      <ul className="flex gap-1">
        {TABS.map((tab) => {
          const href = `/${organizationSlug}/settings/${tab.segment}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={tab.segment}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative -mb-px flex h-10 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-4",
                  active && "border-foreground text-foreground",
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.segment === "members" && (
                  <span className="rounded-full bg-muted px-1.5 font-mono text-xs tabular-nums">{memberCount}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
