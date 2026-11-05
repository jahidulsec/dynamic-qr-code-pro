import React from "react";

import { cn } from "@/lib/utils";
import { BackButton } from "../button/button";

/** Page body under the PageHeader: stacks sections with the dashboard gutter. */
const SectionContainer = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="section-container" {...props} className={cn("flex flex-1 flex-col gap-4 p-4 pt-0 container mx-auto", className)} />
);

/** The app's card surface. Add `p-5` for padded content, or pair with SectionCardHeader for a header bar. */
const Section = ({ className, ...props }: React.ComponentProps<"section">) => (
  <section
    data-slot="section"
    {...props}
    className={cn("flex min-w-0 flex-col rounded-xl bg-card ring-1 ring-foreground/10", className)}
  />
);

/** Intro card at the top of a page: text on the left, actions on the right. */
const SectionHero = ({ className, ...props }: React.ComponentProps<"section">) => (
  <Section
    data-slot="section-hero"
    {...props}
    className={cn("gap-4 p-5 lg:flex-row lg:items-center lg:justify-between", className)}
  />
);

/** Text block: eyebrow, title and description. */
const SectionHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="section-header" {...props} className={cn("flex min-w-0 flex-col gap-2", className)} />
);

/** Row above a hero title for badges and small labels. */
const SectionEyebrow = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="section-eyebrow" {...props} className={cn("flex flex-wrap items-center gap-2", className)} />
);

const SectionBadge = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    data-slot="section-badge"
    {...props}
    className={cn(
      "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 [&_svg]:size-3.5",
      className,
    )}
  />
);

const SectionTitle = ({
  as: Heading = "h2",
  className,
  ...props
}: React.ComponentProps<"h2"> & { as?: "h1" | "h2" | "h3" }) => (
  <Heading
    data-slot="section-title"
    {...props}
    className={cn(
      "flex items-center gap-2 font-semibold [&_svg]:size-4 [&_svg]:text-muted-foreground",
      Heading === "h1" && "text-xl",
      className,
    )}
  />
);

const SectionDescription = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p data-slot="section-description" {...props} className={cn("text-sm text-muted-foreground", className)} />
);

const SectionActions = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="section-actions"
    {...props}
    className={cn("flex shrink-0 flex-wrap items-center gap-2 self-start lg:self-auto", className)}
  />
);

/** Bordered header bar inside a card; put a SectionLabel on the left and meta on the right. */
const SectionCardHeader = ({ className, ...props }: React.ComponentProps<"header">) => (
  <header
    data-slot="section-card-header"
    {...props}
    className={cn("flex items-center justify-between gap-2 border-b px-5 py-4", className)}
  />
);

/** Small uppercase card heading. */
const SectionLabel = ({ className, ...props }: React.ComponentProps<"h2">) => (
  <h2 data-slot="section-label" {...props} className={cn("text-xs font-semibold tracking-wider uppercase", className)} />
);

/** Muted meta text beside a card heading (filters, counts). */
const SectionMeta = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span data-slot="section-meta" {...props} className={cn("font-mono text-xs text-muted-foreground", className)} />
);

const SectionEmpty = ({
  icon,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { icon?: React.ReactNode }) => (
  <div
    data-slot="section-empty"
    {...props}
    className={cn(
      "flex flex-col items-center gap-2 px-4 py-16 text-center text-sm text-muted-foreground [&_svg]:size-8",
      className,
    )}
  >
    {icon}
    {children}
  </div>
);

const SectionHeadingWithBackbutton = ({
  className,
  href,
  heading,
  description,
  ...props
}: React.ComponentProps<"div"> & {
  /** omit to go back in history */
  href?: string;
  heading: string;
  description?: React.ReactNode;
}) => (
  <div data-slot="section-back-heading" {...props} className={cn("flex min-w-0 items-start gap-3", className)}>
    <div className="mt-0.5 shrink-0 rounded-full bg-card ring-1 ring-foreground/10">
      <BackButton href={href} />
    </div>
    <SectionHeader className="gap-1">
      <SectionTitle as="h1" className="text-balance">
        {heading}
      </SectionTitle>
      {description && <SectionDescription className="max-w-prose text-balance">{description}</SectionDescription>}
    </SectionHeader>
  </div>
);

export {
  Section,
  SectionActions,
  SectionBadge,
  SectionCardHeader,
  SectionContainer,
  SectionDescription,
  SectionEmpty,
  SectionEyebrow,
  SectionHeader,
  SectionHeadingWithBackbutton,
  SectionHero,
  SectionLabel,
  SectionMeta,
  SectionTitle,
};
