import { IconAlertTriangle, IconCheck, IconMail, IconX } from "@tabler/icons-react";

import {
  Section,
  SectionCardHeader,
  SectionDescription,
  SectionLabel,
  SectionMeta,
} from "@/components/shared/section/section";
import { Badge } from "@/components/ui/badge";
import { UsageBar } from "@/features/billing/components/usage-bar";
import {
  ENTITLEMENT_STATE_LABELS,
  PLAN_FEATURES,
  PLAN_FEATURE_LABELS,
  PLAN_LIMITS,
  PLAN_LIMIT_LABELS,
  type EntitlementState,
  type PlanLimit,
} from "@/features/billing/constants";
import type { Entitlements } from "@/features/billing/libs/entitlements";

const STATE_BADGE_VARIANTS: Record<EntitlementState, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  expired: "destructive",
  canceled: "destructive",
  none: "outline",
};

export type BillingUsage = Record<PlanLimit, { used: number; hint?: string }>;

type BillingOverviewProps = {
  entitlements: Entitlements;
  /** live counts, measured the same way the limit checks measure them */
  usage: BillingUsage;
  /** limits shown in place of the plan's, e.g. capped by a hard upper bound; null = unlimited */
  limits?: Partial<Record<PlanLimit, number | null>>;
  supportEmail: string;
  formatDate: (date: Date) => string;
};

/** Read-only summary of the plan in effect, its usage and features (spec 03, billing page). */
export function BillingOverview({ entitlements, usage, limits, supportEmail, formatDate }: BillingOverviewProps) {
  const { plan, subscriptionPlan, state, currentPeriodEnd, features } = entitlements;
  const ended = state === "expired" || state === "canceled";
  // after expiry or cancellation the default plan applies; the heading still names the plan that ended
  const shownPlan = ended && subscriptionPlan ? subscriptionPlan : plan;

  const periodText = ended
    ? currentPeriodEnd && state === "expired"
      ? `Ended on ${formatDate(currentPeriodEnd)}`
      : "Canceled"
    : currentPeriodEnd
      ? `${state === "trialing" ? "Trial ends" : "Renews / ends"} on ${formatDate(currentPeriodEnd)}`
      : "No end date";

  return (
    <>
      {ended && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-destructive/5 p-4 text-sm ring-1 ring-destructive/30 [&_svg]:size-4"
        >
          <IconAlertTriangle aria-hidden className="mt-0.5 shrink-0 text-destructive" />
          <p>
            Your {shownPlan.name} plan {state === "canceled" ? "was canceled" : "ended"}
            {state === "expired" && currentPeriodEnd ? ` on ${formatDate(currentPeriodEnd)}` : ""}. You&apos;re on{" "}
            {plan.name} limits. Contact us to extend it.
          </p>
        </div>
      )}

      <Section className="overflow-hidden">
        <SectionCardHeader>
          <div className="flex items-center gap-3">
            <SectionLabel>Plan</SectionLabel>
            <SectionMeta>{periodText}</SectionMeta>
          </div>
        </SectionCardHeader>
        <div className="flex flex-col gap-1 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-semibold">{shownPlan.name}</span>
            <Badge variant={STATE_BADGE_VARIANTS[state]}>{ENTITLEMENT_STATE_LABELS[state]}</Badge>
          </div>
          {ended && <SectionDescription>Limits and features below are the {plan.name} plan&apos;s.</SectionDescription>}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section className="overflow-hidden">
          <SectionCardHeader>
            <SectionLabel>Usage</SectionLabel>
          </SectionCardHeader>
          <div className="flex flex-col gap-5 p-5">
            {PLAN_LIMITS.map((limit) => (
              <UsageBar
                key={limit}
                label={PLAN_LIMIT_LABELS[limit]}
                used={usage[limit].used}
                limit={limits && limit in limits ? (limits[limit] ?? null) : entitlements.limits[limit]}
                hint={usage[limit].hint}
              />
            ))}
          </div>
        </Section>

        <Section className="overflow-hidden">
          <SectionCardHeader>
            <SectionLabel>Included features</SectionLabel>
          </SectionCardHeader>
          <ul className="flex flex-col gap-3 p-5">
            {PLAN_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm [&_svg]:size-4">
                {features[feature] ? (
                  <IconCheck aria-label="Included" className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <IconX aria-label="Not included" className="text-muted-foreground" />
                )}
                <span className={features[feature] ? undefined : "text-muted-foreground"}>
                  {PLAN_FEATURE_LABELS[feature]}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Section className="flex-row flex-wrap items-center justify-between gap-3 p-5">
        <SectionDescription>Need more? Contact us to change your plan.</SectionDescription>
        <a
          href={`mailto:${supportEmail}`}
          className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 [&_svg]:size-4"
        >
          <IconMail aria-hidden />
          {supportEmail}
        </a>
      </Section>
    </>
  );
}
