import { IconLock } from "@tabler/icons-react";

import { Section, SectionDescription, SectionTitle } from "@/components/shared/section/section";
import { PLAN_FEATURE_DENIED_MESSAGES, PLAN_FEATURE_LABELS, type PlanFeature } from "@/features/billing/constants";

/** Shown in place of a page whose feature the plan in effect doesn't include. */
export function PlanUpgradeNotice({ feature, planName }: { feature: PlanFeature; planName?: string }) {
  return (
    <Section className="items-center gap-2 p-10 text-center">
      <SectionTitle>
        <IconLock aria-hidden />
        {PLAN_FEATURE_LABELS[feature]}
      </SectionTitle>
      <SectionDescription>{PLAN_FEATURE_DENIED_MESSAGES[feature]}</SectionDescription>
      <SectionDescription>
        {planName ? `Your organization is on the ${planName} plan. ` : ""}Ask an owner to upgrade to unlock it.
      </SectionDescription>
    </Section>
  );
}
