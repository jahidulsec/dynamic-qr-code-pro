"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useEffectEvent, useState, useTransition } from "react";
import { IconLoader2, IconSearch } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  /** search param the text is written to */
  paramKey?: string;
  /** ms to wait after the last keystroke before updating the URL */
  delay?: number;
  /** params cleared whenever the search changes (e.g. pagination) */
  resetKeys?: string[];
  containerClassName?: string;
};

/**
 * Search box synced to a URL search param. Typing is debounced, then the URL
 * is replaced so server components re-render with the new query.
 */
export function SearchInput({
  paramKey = "q",
  delay = 300,
  resetKeys = ["page"],
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlValue = searchParams.get(paramKey) ?? "";
  const [value, setValue] = useState(urlValue);
  const [syncedUrlValue, setSyncedUrlValue] = useState(urlValue);

  // follow URL changes made elsewhere (back/forward, cleared filters, links)
  if (urlValue !== syncedUrlValue) {
    setSyncedUrlValue(urlValue);
    if (urlValue !== value.trim()) setValue(urlValue);
  }

  // reads the latest params at fire time, so other filters changed meanwhile are kept
  const commit = useEffectEvent((next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(paramKey, next);
    else params.delete(paramKey);
    for (const key of resetKeys) params.delete(key);
    const query = params.toString();
    startTransition(() =>
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }),
    );
  });

  useEffect(() => {
    const next = value.trim();
    if (next === urlValue) return;
    const timer = setTimeout(() => commit(next), delay);
    return () => clearTimeout(timer);
  }, [value, urlValue, delay]);

  return (
    <div className={cn("relative", containerClassName)} aria-busy={isPending}>
      {isPending ? (
        <IconLoader2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      ) : (
        <IconSearch className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        {...props}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className={cn("pl-9", className)}
      />
    </div>
  );
}
