import { SectionHeading } from "@/features/home/components/section-heading";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Create",
    description: "Paste a link, pick a style and add your logo. Your code is ready in under a minute.",
    color: "bg-brand-violet",
  },
  {
    title: "Share",
    description: "Download as PNG or SVG and put it anywhere — menus, packaging, posters, business cards.",
    color: "bg-brand-coral",
  },
  {
    title: "Update & measure",
    description: "Swap the destination whenever you need and watch scans roll in on your dashboard.",
    color: "bg-brand-mint",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-y bg-muted py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="How it works" title="From link to live in three steps" />

        <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="space-y-4 border-t border-foreground/10 pt-8">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-full font-heading text-sm font-semibold text-zinc-950",
                  step.color
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-heading text-xl font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
