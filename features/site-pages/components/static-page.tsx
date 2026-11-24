import React from "react";

import { cn } from "@/lib/utils";

type StaticPageProps = React.PropsWithChildren<{
  eyebrow: string;
  title: string;
  description?: string;
  lastUpdated?: string;
  className?: string;
}>;

/** Shared shell for support, status and legal pages. */
export function StaticPage({ eyebrow, title, description, lastUpdated, className, children }: StaticPageProps) {
  return (
    <article className={cn("mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20", className)}>
      <header className="space-y-4 border-b pb-8">
        <p className="flex w-fit items-center gap-2 text-sm font-medium text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          {eyebrow}
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
        {description && <p className="text-lg text-pretty text-muted-foreground">{description}</p>}
        {lastUpdated && <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>}
      </header>
      <div className="space-y-10 pt-10">{children}</div>
    </article>
  );
}

type PageSectionProps = React.PropsWithChildren<{ id?: string; title: string }>;

/** A titled block of body copy. Paragraphs, lists and links inside get prose styling. */
export function PageSection({ id, title, children }: PageSectionProps) {
  return (
    <section id={id} className="scroll-mt-20 space-y-3">
      <h2 className="font-heading text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
