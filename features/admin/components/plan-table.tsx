import { IconCheck, IconCreditCard, IconX } from "@tabler/icons-react";

import { SectionEmpty } from "@/components/shared/section/section";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlanRowActions } from "@/features/admin/components/plan-row-actions";
import type { getAdminPlan } from "@/features/admin/libs/admin-plans";
import { PLAN_FEATURE_LABELS, PLAN_FEATURES } from "@/features/billing";

export type AdminPlan = NonNullable<Awaited<ReturnType<typeof getAdminPlan>>["data"]>;

/** Minor units (cents) as a price, e.g. 999 USD → "$9.99". */
export const formatPrice = (cents: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
};

const formatLimit = (limit: number | null) => (limit === null ? "Unlimited" : limit.toLocaleString());

/** /admin/plans (spec 04): name, key, prices, limits, features, badges and "{n} organizations". */
export function AdminPlanTable({ plans }: { plans: AdminPlan[] }) {
  if (!plans.length) return <SectionEmpty icon={<IconCreditCard />}>No plans yet.</SectionEmpty>;

  return (
    <Table className="[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
      <TableHeader>
        <TableRow className="text-xs uppercase">
          <TableHead className="pl-4">Plan</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">QR codes</TableHead>
          <TableHead className="text-right">Members</TableHead>
          <TableHead className="text-right">Custom roles</TableHead>
          <TableHead>Features</TableHead>
          <TableHead className="text-right">Organizations</TableHead>
          <TableHead className="pr-4">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {plans.map((plan) => (
          <TableRow key={plan.id} className={plan.archivedAt ? "text-muted-foreground" : undefined}>
            <TableCell className="max-w-64 pl-4">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium" title={plan.name}>
                  {plan.name}
                </span>
                {plan.isDefault && <Badge>Default</Badge>}
                {plan.archivedAt && <Badge variant="secondary">Archived</Badge>}
                {!plan.isPublic && <Badge variant="outline">Hidden</Badge>}
              </div>
              <div className="truncate font-mono text-xs text-muted-foreground">{plan.key}</div>
            </TableCell>
            <TableCell>
              <div>{formatPrice(plan.priceMonthly, plan.currency)} / month</div>
              <div className="text-xs text-muted-foreground">{formatPrice(plan.priceYearly, plan.currency)} / year</div>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatLimit(plan.maxQrCodes)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatLimit(plan.maxMembers)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatLimit(plan.maxCustomRoles)}</TableCell>
            <TableCell>
              <ul className="flex flex-col gap-0.5 text-xs">
                {PLAN_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-1.5">
                    {plan.features[feature] ? (
                      <IconCheck className="size-3.5 text-primary" aria-label="Included" />
                    ) : (
                      <IconX className="size-3.5 text-muted-foreground" aria-label="Not included" />
                    )}
                    {PLAN_FEATURE_LABELS[feature]}
                  </li>
                ))}
              </ul>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{plan.organizationCount.toLocaleString()}</TableCell>
            <TableCell className="pr-4">
              <PlanRowActions plan={plan} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
