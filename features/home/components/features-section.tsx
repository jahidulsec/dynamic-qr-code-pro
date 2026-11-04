import {
  IconArrowRight,
  IconChartBar,
  IconCheck,
  IconClock,
  IconLock,
  IconPalette,
  IconQrcode,
  IconRefresh,
  IconStack2,
  IconUsers,
  type TablerIcon,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

import { SectionHeading } from "@/features/home/components/section-heading";
import { cn } from "@/lib/utils";

// Static class strings so Tailwind can see them.
const tones = {
  violet: { panel: "bg-brand-violet/10", dot: "bg-brand-violet" },
  mint: { panel: "bg-brand-mint/15", dot: "bg-brand-mint" },
  coral: { panel: "bg-brand-coral/10", dot: "bg-brand-coral" },
  sky: { panel: "bg-brand-sky/15", dot: "bg-brand-sky" },
  amber: { panel: "bg-brand-amber/20", dot: "bg-brand-amber" },
};

function EditVisual() {
  return (
    <div className="flex w-full max-w-md items-center gap-3">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5">
        <IconQrcode className="size-8" />
      </span>
      <div className="min-w-0 flex-1 space-y-2 text-xs">
        <p className="truncate rounded-full bg-card/60 px-3 py-1.5 text-muted-foreground line-through">
          acme.co/summer-sale
        </p>
        <p className="flex items-center gap-1.5 truncate rounded-full bg-card px-3 py-1.5 font-medium shadow-sm ring-1 ring-foreground/5">
          <IconArrowRight className="size-3.5 shrink-0 text-brand-violet" />
          acme.co/winter-collection
        </p>
      </div>
    </div>
  );
}

const scanBars = [35, 52, 44, 68, 58, 80, 72, 95, 84, 100];
const devices = [
  { name: "iOS", share: 58 },
  { name: "Android", share: 34 },
  { name: "Desktop", share: 8 },
];

function AnalyticsVisual() {
  return (
    <div className="w-full space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Scans this month</p>
          <p className="font-heading text-3xl font-semibold tracking-tight">12,480</p>
        </div>
        <span className="rounded-full bg-card px-2 py-1 text-xs font-medium text-success shadow-sm">+18%</span>
      </div>
      <div className="flex h-28 items-end gap-1.5">
        {scanBars.map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-t-md bg-brand-mint"
            style={{ height: `${height}%`, opacity: 0.35 + (index / scanBars.length) * 0.65 }}
          />
        ))}
      </div>
      <ul className="space-y-2.5 text-xs">
        {devices.map((device) => (
          <li key={device.name} className="space-y-1">
            <div className="flex justify-between">
              <span>{device.name}</span>
              <span className="text-muted-foreground">{device.share}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-card">
              <div className="h-full rounded-full bg-brand-mint" style={{ width: `${device.share}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandVisual() {
  return (
    <div className="flex items-center gap-4">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-foreground/5">
        <IconQrcode className="size-10 text-brand-coral" />
      </span>
      <div className="flex -space-x-2">
        {["bg-brand-coral", "bg-brand-violet", "bg-brand-sky", "bg-foreground"].map((color) => (
          <span key={color} className={cn("size-8 rounded-full ring-2 ring-card", color)} />
        ))}
      </div>
    </div>
  );
}

const members = [
  { initials: "AK", color: "bg-brand-sky" },
  { initials: "MJ", color: "bg-brand-violet" },
  { initials: "SR", color: "bg-brand-amber" },
];

function TeamVisual() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {members.map((member) => (
          <span
            key={member.initials}
            className={cn(
              "flex size-9 items-center justify-center rounded-full text-xs font-semibold text-zinc-950 ring-2 ring-card",
              member.color
            )}
          >
            {member.initials}
          </span>
        ))}
      </div>
      <span className="rounded-full bg-card px-2.5 py-1 text-xs font-medium shadow-sm">+12 editors</span>
    </div>
  );
}

const csvRows = ["menu-table-01", "menu-table-02", "menu-table-03"];

function BulkVisual() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-card text-xs shadow-sm ring-1 ring-foreground/5">
      <div className="flex justify-between border-b px-4 py-2 font-mono text-muted-foreground">
        <span>tables.csv</span>
        <span>240 rows</span>
      </div>
      <ul className="divide-y">
        {csvRows.map((row) => (
          <li key={row} className="flex items-center justify-between px-4 py-2 font-mono">
            {row}
            <IconCheck className="size-3.5 text-success" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProtectVisual() {
  return (
    <div className="space-y-2 text-xs">
      <p className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-sm">
        <IconLock className="size-3.5" />
        <span className="tracking-[0.3em]">••••••</span>
      </p>
      <p className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-sm">
        <IconClock className="size-3.5" />
        Expires Dec 31
      </p>
    </div>
  );
}

type Feature = {
  icon: TablerIcon;
  title: string;
  description: string;
  tone: keyof typeof tones;
  visual: ReactNode;
  className?: string;
};

const features: Feature[] = [
  {
    icon: IconRefresh,
    title: "Edit anytime, reprint never",
    description:
      "Change the destination URL of any code in seconds. Your printed flyers, packaging and signage keep working.",
    tone: "violet",
    visual: <EditVisual />,
    className: "md:col-span-2",
  },
  {
    icon: IconChartBar,
    title: "Real-time scan analytics",
    description: "Track scans by time, location, device and browser.",
    tone: "mint",
    visual: <AnalyticsVisual />,
    className: "md:row-span-2",
  },
  {
    icon: IconPalette,
    title: "On-brand designs",
    description: "Custom colors, shapes and your logo in the center.",
    tone: "coral",
    visual: <BrandVisual />,
  },
  {
    icon: IconUsers,
    title: "Team workspaces",
    description: "Invite teammates into organizations, share codes across projects and control who can edit what.",
    tone: "sky",
    visual: <TeamVisual />,
  },
  {
    icon: IconStack2,
    title: "Bulk generation",
    description: "Create hundreds of codes at once from a CSV.",
    tone: "amber",
    visual: <BulkVisual />,
    className: "md:col-span-2",
  },
  {
    icon: IconLock,
    title: "Password & expiry",
    description: "Protect codes and schedule when they stop working.",
    tone: "violet",
    visual: <ProtectVisual />,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-16 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to run QR campaigns"
          description="Static codes are set in stone. Dynamic codes give you control, insight and flexibility for every print run."
        />

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description, tone, visual, className }) => (
            <div
              key={title}
              className={cn(
                "group flex flex-col overflow-hidden rounded-3xl border bg-card p-2 transition-shadow hover:shadow-lg hover:shadow-foreground/5",
                className
              )}
            >
              <div
                className={cn(
                  "flex min-h-40 flex-1 items-center justify-center rounded-[1.25rem] p-6",
                  tones[tone].panel
                )}
              >
                {visual}
              </div>
              <div className="flex gap-4 p-5">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-950 transition-transform group-hover:-rotate-6",
                    tones[tone].dot
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-heading font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-pretty text-muted-foreground">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
