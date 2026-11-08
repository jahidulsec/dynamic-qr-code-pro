"use client";

import { IconCrown, IconEye, IconShield, IconUser, IconUserCog } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { useAccess } from "@/features/organizations/components/access-provider";
import { parseRoles, roleLabel } from "@/features/organizations/libs/roles";
import type { SystemRole } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<SystemRole, React.ReactNode> = {
  owner: <IconCrown data-icon="inline-start" />,
  admin: <IconShield data-icon="inline-start" />,
  member: <IconUser data-icon="inline-start" />,
  viewer: <IconEye data-icon="inline-start" />,
};

const ROLE_STYLES: Record<SystemRole, string> = {
  owner: "border-primary/30 bg-primary/10 text-primary",
  admin: "border-border bg-secondary text-secondary-foreground",
  member: "border-border text-muted-foreground",
  viewer: "border-dashed border-border text-muted-foreground",
};

// custom roles share one look; their names tell them apart
const CUSTOM_ICON = <IconUserCog data-icon="inline-start" />;
const CUSTOM_STYLE = "border-border text-foreground";

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  const { roles } = useAccess();
  const keys = parseRoles(role);
  if (!keys.length) return null;

  return (
    <span className={cn("flex flex-wrap gap-1", className)}>
      {keys.map((key) => (
        <Badge key={key} variant="outline" className={ROLE_STYLES[key as SystemRole] ?? CUSTOM_STYLE}>
          {ROLE_ICONS[key as SystemRole] ?? CUSTOM_ICON}
          {roleLabel(key, roles)}
        </Badge>
      ))}
    </span>
  );
}
