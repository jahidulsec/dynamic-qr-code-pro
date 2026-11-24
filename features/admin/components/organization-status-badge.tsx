import { Badge } from "@/components/ui/badge";
import type { OrganizationStatus } from "@/generated/prisma/client";
import type { PlanState } from "@/features/admin/libs/admin-organization-query";

const STATUS_BADGES = {
  PENDING: { label: "Pending", variant: "secondary" },
  ACTIVE: { label: "Active", variant: "outline" },
  SUSPENDED: { label: "Suspended", variant: "destructive" },
  REJECTED: { label: "Rejected", variant: "destructive" },
} as const satisfies Record<OrganizationStatus, { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }>;

export function OrganizationStatusBadge({ status }: { status: OrganizationStatus }) {
  const { label, variant } = STATUS_BADGES[status];
  return <Badge variant={variant}>{label}</Badge>;
}

const PLAN_STATE_BADGES = {
  active: { label: "Active", variant: "outline" },
  trialing: { label: "Trial", variant: "secondary" },
  expired: { label: "Expired", variant: "destructive" },
  canceled: { label: "Canceled", variant: "destructive" },
  none: { label: "No subscription", variant: "ghost" },
} as const satisfies Record<PlanState, { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }>;

export function PlanStateBadge({ state }: { state: PlanState }) {
  const { label, variant } = PLAN_STATE_BADGES[state];
  return <Badge variant={variant}>{label}</Badge>;
}
