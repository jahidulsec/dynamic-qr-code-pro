"use client";

import { Button } from "@/components/ui/button";
import type { SelectablePlan } from "@/features/admin/components/approve-organization-dialog";
import { CancelSubscriptionDialog } from "@/features/admin/components/cancel-subscription-dialog";
import { ChangePlanDialog, type CurrentSubscription } from "@/features/admin/components/change-plan-dialog";
import { ExtendSubscriptionDialog } from "@/features/admin/components/extend-subscription-dialog";
import type { OrganizationStatus } from "@/generated/prisma/client";

type SubscriptionActionsProps = {
  organization: { id: string; name: string; status: OrganizationStatus };
  subscription: (CurrentSubscription & { planName: string }) | null;
  /** plans that aren't archived; includes the default plan, which can't be archived */
  plans: SelectablePlan[];
};

/** Change plan, Extend and Cancel (spec 04), shown when they apply. */
export function SubscriptionActions({ organization, subscription, plans }: SubscriptionActionsProps) {
  // approving sets the first subscription; until then there's nothing to change
  if (organization.status === "PENDING" || organization.status === "REJECTED")
    return <p className="text-xs text-muted-foreground">Approve the organization to set its plan.</p>;

  const live = subscription && subscription.status !== "CANCELED" ? subscription : null;
  const defaultPlanName = plans.find((plan) => plan.isDefault)?.name ?? "the default plan";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ChangePlanDialog
        organization={organization}
        subscription={subscription}
        plans={plans}
        trigger={<Button size="sm" variant="outline" />}
      >
        {live ? "Change plan" : "Set plan"}
      </ChangePlanDialog>
      {live?.currentPeriodEnd && (
        <ExtendSubscriptionDialog
          organization={organization}
          planName={live.planName}
          currentPeriodEnd={live.currentPeriodEnd}
          trigger={<Button size="sm" variant="outline" />}
        >
          Extend
        </ExtendSubscriptionDialog>
      )}
      {live && (
        <CancelSubscriptionDialog organization={organization} planName={live.planName} defaultPlanName={defaultPlanName} />
      )}
    </div>
  );
}
