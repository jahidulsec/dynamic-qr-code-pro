import { IconTools } from "@tabler/icons-react";

// stands in for a panel page until its ticket replaces it
export function AdminPlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-1 flex-col p-4 md:p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-center">
        <IconTools className="size-8 text-muted-foreground" />
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-balance text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
