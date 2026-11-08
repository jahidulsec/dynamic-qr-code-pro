"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconBuilding, IconHistory, IconShieldLock, IconUsers } from "@tabler/icons-react";

import { useAccess } from "@/features/organizations/components/access-provider";
import type { Permissions } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

const TABS: { segment: string; label: string; icon: React.ReactNode; requires?: Permissions }[] = [
  { segment: "general", label: "General", icon: <IconBuilding /> },
  { segment: "members", label: "Members", icon: <IconUsers /> },
  { segment: "roles", label: "Roles", icon: <IconShieldLock />, requires: { ac: ["read"] } },
  { segment: "audit-log", label: "Audit log", icon: <IconHistory />, requires: { audit: ["read"] } },
];

export function SettingsNav({ organizationSlug, memberCount }: { organizationSlug: string; memberCount: number }) {
  const pathname = usePathname();
  const { can } = useAccess();

  return (
    <nav aria-label="Settings" className="-mx-4 overflow-x-auto border-b px-4">
      <ul className="flex gap-1">
        {TABS.filter((tab) => !tab.requires || can(tab.requires)).map((tab) => {
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
