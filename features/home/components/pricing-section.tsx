import Link from "next/link";
import { IconCheck } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/features/home/components/section-heading";
import { cn } from "@/lib/utils";

export const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For trying things out.",
    features: ["3 dynamic QR codes", "Basic scan analytics", "PNG downloads"],
    cta: "Start for free",
  },
  {
    name: "Pro",
    price: "$12",
    description: "For growing businesses.",
    features: [
      "100 dynamic QR codes",
      "Advanced analytics",
      "Custom colors & logo",
      "SVG & PDF downloads",
      "Password & expiry",
    ],
    cta: "Start 14-day trial",
    featured: true,
  },
  {
    name: "Team",
    price: "$39",
    description: "For teams and agencies.",
    features: ["Unlimited QR codes", "Everything in Pro", "Team workspaces", "Bulk generation", "API access"],
    cta: "Start 14-day trial",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing that scales with you"
          description="Start free. Upgrade when you need more codes, deeper insights or your whole team."
        />

        <div className="mt-16 grid items-start gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col gap-8 rounded-3xl bg-card p-8 ring-1 ring-foreground/10",
                plan.featured && "bg-primary text-primary-foreground ring-0"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
                  {plan.featured && (
                    <span className="rounded-full bg-brand-amber px-2.5 py-0.5 text-xs font-medium text-zinc-950">
                      Most popular
                    </span>
                  )}
                </div>
                <p className={cn("text-sm text-muted-foreground", plan.featured && "text-primary-foreground/70")}>
                  {plan.description}
                </p>
                <p className="pt-4">
                  <span className="font-heading text-5xl font-semibold tracking-tight">{plan.price}</span>
                  <span className={cn("text-sm text-muted-foreground", plan.featured && "text-primary-foreground/70")}>
                    {" "}
                    / month
                  </span>
                </p>
              </div>

              <ul className="flex-1 space-y-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <IconCheck className={cn("size-4 shrink-0 text-primary", plan.featured && "text-brand-amber")} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                className={cn(
                  "w-full rounded-full",
                  plan.featured && "bg-white text-zinc-950 hover:bg-white/90"
                )}
                size="lg"
                variant={plan.featured ? "default" : "outline"}
                nativeButton={false}
                render={<Link href="/sign-up" />}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
