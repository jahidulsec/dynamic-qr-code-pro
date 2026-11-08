import { IconCrown, IconShield, IconUser } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { parseRoles, roleLabel, type OrganizationRole } from "@/features/organizations/libs/roles";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<OrganizationRole, React.ReactNode> = {
  owner: <IconCrown data-icon="inline-start" />,
  admin: <IconShield data-icon="inline-start" />,
  member: <IconUser data-icon="inline-start" />,
};

const ROLE_STYLES: Record<OrganizationRole, string> = {
  owner: "border-primary/30 bg-primary/10 text-primary",
  admin: "border-border bg-secondary text-secondary-foreground",
  member: "border-border text-muted-foreground",
};

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  const roles = parseRoles(role);
  if (!roles.length) return <Badge variant="outline" className={className}>{role}</Badge>;

  return (
    <span className={cn("flex flex-wrap gap-1", className)}>
      {roles.map((r) => (
        <Badge key={r} variant="outline" className={ROLE_STYLES[r]}>
          {ROLE_ICONS[r]}
          {roleLabel(r)}
        </Badge>
      ))}
    </span>
  );
}
