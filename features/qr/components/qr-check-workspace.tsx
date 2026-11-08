"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type KeyboardEvent } from "react";
import { IconCircleCheckFilled, IconQrcode, IconScan } from "@tabler/icons-react";

import { SearchInput } from "@/components/shared/input/search";
import { Section, SectionEmpty, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import { Badge } from "@/components/ui/badge";
import { QrCodeImage } from "@/features/qr/components/qr-code-image";
import { QrFormDialog } from "@/features/qr/components/qr-form-dialog";
import { QR_CHECK_STATUS, QrTestScanButton, type QrCheckState } from "@/features/qr/components/qr-test-scan-button";
import type { QrCheckItem } from "@/features/qr/libs/qr-check";
import { cn } from "@/lib/utils";
import { formatTags } from "@/utils/format";

type QrCheckWorkspaceProps = {
  organizationSlug: string;
  baseUrl: string;
  tags: string[];
  items: QrCheckItem[];
  /** every match, which can be more than the items shown */
  count: number;
  /** the selection resolved on the server; may sit outside `items` when opened from a shared link */
  selected: QrCheckItem | null;
  emptyMessage: string;
};

export function QrCheckWorkspace({
  organizationSlug,
  baseUrl,
  tags,
  items,
  count,
  selected: serverSelected,
  emptyMessage,
}: QrCheckWorkspaceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // selection shows immediately; the URL catches up so the page can be shared or reloaded
  const [selectedId, setSelectedId] = useState(serverSelected?.id ?? null);
  const [syncedId, setSyncedId] = useState(serverSelected?.id ?? null);
  if ((serverSelected?.id ?? null) !== syncedId) {
    setSyncedId(serverSelected?.id ?? null);
    setSelectedId(serverSelected?.id ?? null);
  }

  const selected =
    items.find((item) => item.id === selectedId) ?? (serverSelected?.id === selectedId ? serverSelected : null);

  // optimistic counts per code: the real scan is recorded by the short link after the redirect is sent,
  // so show whichever is higher until the server catches up
  const [optimistic, setOptimistic] = useState<Record<number, number>>({});
  const scansOf = (item: QrCheckItem) => Math.max(item.scanCount, optimistic[item.id] ?? 0);

  const select = (id: number) => {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", String(id));
    startTransition(() => router.replace(`${pathname}?${params}`, { scroll: false }));
  };

  const [editOpen, setEditOpen] = useState(false);
  // a fresh key per opening resets the form to the latest saved values
  const [editKey, setEditKey] = useState(0);

  // arrow keys move between results, like a listbox
  const onListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-qr-id]"));
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = buttons[index + (event.key === "ArrowDown" ? 1 : -1)] ?? buttons[event.key === "ArrowDown" ? 0 : buttons.length - 1];
    if (!next) return;
    event.preventDefault();
    next.focus();
    select(Number(next.dataset.qrId));
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Section className="gap-3 p-5">
        <SectionLabel>Search QR code to check</SectionLabel>
        <SearchInput
          resetKeys={["id"]}
          placeholder="Type ID (e.g. # 542), campaign title, tag, or URL…"
          aria-label="Search QR codes to check"
        />
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {count > items.length
            ? `Showing ${items.length} of ${count.toLocaleString()} matching QR codes. Refine the search to narrow it down.`
            : `${count.toLocaleString()} matching dynamic QR ${count === 1 ? "code" : "codes"} available`}
        </p>

        {items.length ? (
          <div
            role="group"
            aria-label="QR codes"
            onKeyDown={onListKeyDown}
            className="-mx-1 flex max-h-[min(36rem,60dvh)] flex-col gap-2 overflow-y-auto p-1"
          >
            {items.map((item) => {
              const isSelected = item.id === selected?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-qr-id={item.id}
                  aria-pressed={isSelected}
                  onClick={() => select(item.id)}
                  className={cn(
                    "flex flex-col gap-2 rounded-lg p-3 text-left ring-1 ring-foreground/10 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected && "bg-muted/40 ring-2 ring-foreground",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 rounded-md px-1.5 py-0.5 font-mono text-xs font-medium ring-1 ring-foreground/15">
                      #&nbsp;{item.id}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold" title={item.name}>
                      {item.name}
                    </span>
                    {item.state !== "ready" && <StatusBadge state={item.state} />}
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">{item.tags.length > 1 ? "Tags" : "Tag"}: {formatTags(item.tags)}</span>
                    {isSelected && <IconCircleCheckFilled className="size-4 shrink-0" aria-hidden />}
                  </div>
                  <div className="flex items-center justify-between gap-3 font-mono text-xs">
                    <span className="truncate text-muted-foreground" title={item.destination}>
                      {item.destination}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {scansOf(item).toLocaleString()} {scansOf(item) === 1 ? "scan" : "scans"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <SectionEmpty icon={<IconQrcode />}>{emptyMessage}</SectionEmpty>
        )}
      </Section>

      <div className="flex flex-col gap-4">
        <Section className="gap-4 p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SectionLabel>Active viewfinder target</SectionLabel>
              {selected && (
                <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-mono text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  #&nbsp;{selected.id}
                </span>
              )}
            </div>
            {!!selected?.tags.length && (
              <SectionMeta>
                {selected.tags.length > 1 ? "Tags" : "Tag"}: {selected.tags.join(", ")}
              </SectionMeta>
            )}
          </div>

          {selected ? (
            <>
              {/* the simulator stays dark in both themes, like a phone camera view */}
              <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-zinc-950 p-5 text-zinc-50 shadow-lg">
                <div className="flex items-center gap-1.5 self-start font-mono text-[0.625rem] tracking-wider text-zinc-400 uppercase">
                  <span
                    aria-hidden
                    className={cn("size-1.5 rounded-full", selected.state === "ready" ? "bg-emerald-400" : "bg-amber-400")}
                  />
                  {selected.state === "ready" ? "Scan simulator active" : `Code ${QR_CHECK_STATUS[selected.state].label.toLowerCase()}`}
                </div>
                {/* QR codes print on paper, so the tile keeps its own background */}
                <div className="w-full max-w-48 rounded-xl p-3" style={{ background: selected.qrStyle.background }}>
                  <QrCodeImage value={selected.qrValue} style={selected.qrStyle} className="mx-auto aspect-auto h-auto w-full" />
                </div>
                <div className="flex max-w-full flex-col items-center gap-1 text-center">
                  <span className="max-w-full truncate text-sm font-semibold" title={selected.name}>
                    {selected.name}
                  </span>
                  <span className="max-w-full truncate font-mono text-xs text-zinc-400">{selected.qrLabel}</span>
                </div>
              </div>

              <QrTestScanButton
                size="lg"
                className="w-full"
                qrValue={selected.qrValue}
                state={selected.state}
                readyLabel="Click to Test Scan (+1 Count Increment)"
                onScan={() =>
                  setOptimistic((counts) => ({ ...counts, [selected.id]: scansOf(selected) + 1 }))
                }
              />
            </>
          ) : (
            <SectionEmpty icon={<IconScan />}>Pick a QR code to load it into the viewfinder.</SectionEmpty>
          )}
        </Section>

        {selected && (
          <Section className="gap-4 p-5">
            <div className="flex items-center justify-between gap-2 border-b pb-3">
              <SectionLabel>Dynamic redirect telemetry</SectionLabel>
              <span className="font-mono text-sm font-semibold tabular-nums" aria-live="polite">
                {scansOf(selected).toLocaleString()} Total {scansOf(selected) === 1 ? "Scan" : "Scans"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground">Routing status</span>
<StatusBadge state={selected.state} />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Destination embedded URL</span>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() => {
                    setEditKey((key) => key + 1);
                    setEditOpen(true);
                  }}
                >
                  Edit URL
                </button>
              </div>
              <div className="flex h-9 items-center rounded-md border bg-muted/30 px-3 font-mono text-sm">
                <span className="truncate" title={selected.destination}>
                  {selected.destination}
                </span>
              </div>
            </div>

            {editKey > 0 && (
              <QrFormDialog
                key={`${selected.id}-${editKey}`}
                organizationSlug={organizationSlug}
                baseUrl={baseUrl}
                tags={tags}
                qr={{ id: selected.id, values: selected.editValues }}
                open={editOpen}
                onOpenChange={setEditOpen}
              />
            )}
          </Section>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ state }: { state: QrCheckState }) {
  const status = QR_CHECK_STATUS[state];
  return (
    <Badge className={status.className}>
      <status.icon data-icon="inline-start" />
      {status.label}
    </Badge>
  );
}
