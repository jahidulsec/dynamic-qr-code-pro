import { Progress, ProgressLabel } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type UsageBarProps = {
  label: string;
  used: number;
  /** null = unlimited */
  limit: number | null;
  /** extra line under the bar, e.g. how the count is made up */
  hint?: string;
};

/** "{used} / {limit}" with a bar; unlimited limits show as text, without a bar. */
export function UsageBar({ label, used, limit, hint }: UsageBarProps) {
  const full = limit !== null && used >= limit;

  return (
    <div className="flex flex-col gap-1.5">
      {limit === null ? (
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-medium">{label}</span>
          <span className="ml-auto font-mono text-sm text-muted-foreground tabular-nums">{used} · Unlimited</span>
        </div>
      ) : (
        <Progress
          value={limit === 0 ? (used > 0 ? 100 : 0) : Math.min(100, (used / limit) * 100)}
          className={cn(full && "[&_[data-slot=progress-indicator]]:bg-destructive")}
        >
          <ProgressLabel>{label}</ProgressLabel>
          {/* plain text: ProgressValue's render-function child can't cross from a server component */}
          <span className={cn("ml-auto font-mono text-sm text-muted-foreground tabular-nums", full && "text-destructive")}>
            {used} / {limit}
          </span>
        </Progress>
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
