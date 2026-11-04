import Link from "next/link";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroQrGenerator } from "@/features/home/components/hero-qr-generator";

const highlights = ["No credit card required", "Unlimited edits", "Cancel anytime"];

export function HeroSection() {
  return (
    <section className="bg-brand-violet/5">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
        <div className="space-y-8">
          <Badge variant="outline" className="h-7 gap-2 rounded-full bg-card px-3 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-brand-mint" />
            Edit destinations after printing
          </Badge>

          <div className="space-y-6">
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              QR codes that{" "}
              <span className="relative isolate whitespace-nowrap">
                <span aria-hidden className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-full bg-brand-amber/60 sm:h-4" />
                change
              </span>{" "}
              when your plans do.
            </h1>
            <p className="max-w-lg text-lg text-pretty text-muted-foreground">
              Create branded, dynamic QR codes, update where they point at any time, and see exactly who scans them —
              all from one dashboard.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full px-5" nativeButton={false} render={<Link href="/sign-up" />}>
              Create your first QR code
              <IconArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="rounded-full px-5"
              nativeButton={false}
              render={<Link href="#how-it-works" />}
            >
              See how it works
            </Button>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <IconCheck className="size-4 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="mx-auto w-full max-w-md rounded-[2rem] bg-brand-violet/15 p-6 sm:p-10">
      <HeroQrGenerator />
    </div>
  );
}
