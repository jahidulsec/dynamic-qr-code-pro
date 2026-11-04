import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "start";
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl space-y-4", align === "center" && "mx-auto text-center", className)}>
      <p
        className={cn(
          "flex w-fit items-center gap-2 text-sm font-medium text-primary",
          align === "center" && "mx-auto"
        )}
      >
        <span className="size-1.5 rounded-full bg-primary" />
        {eyebrow}
      </p>
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description && <p className="text-lg text-pretty text-muted-foreground">{description}</p>}
    </div>
  );
}
