import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-20 text-center text-primary-foreground sm:px-12">
          {/* Scattered QR-style modules in the brand colors */}
          <div aria-hidden className="absolute top-8 left-8 grid grid-cols-2 gap-1.5">
            <span className="size-5 rounded-md bg-brand-amber" />
            <span className="size-5 rounded-md bg-brand-mint" />
            <span className="size-5 rounded-md bg-brand-coral" />
          </div>
          <div aria-hidden className="absolute right-8 bottom-8 grid grid-cols-2 gap-1.5">
            <span className="col-start-2 size-5 rounded-md bg-brand-sky" />
            <span className="size-5 rounded-md bg-brand-violet" />
            <span className="size-5 rounded-md bg-brand-amber" />
          </div>

          <div className="relative mx-auto max-w-2xl space-y-6">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
              Your next print run deserves a smarter QR code.
            </h2>
            <p className="text-lg text-primary-foreground/70">
              Join businesses that update campaigns without reprinting a single flyer.
            </p>
            <Button
              size="lg"
              className="rounded-full bg-white px-5 text-zinc-950 hover:bg-white/90"
              nativeButton={false}
              render={<Link href="/sign-up" />}
            >
              Get started for free
              <IconArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
