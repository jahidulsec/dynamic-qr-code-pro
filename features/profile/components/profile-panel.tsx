import { cn } from "@/lib/utils";

/** Layout for one tab of the profile dialog: header, scrolling body, footer pinned to the bottom. */
export function PanelHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1 border-b px-6 py-5 pr-14">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function PanelBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", className)} />;
}

export function PanelFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col-reverse gap-3 border-t bg-muted/40 px-6 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    />
  );
}
