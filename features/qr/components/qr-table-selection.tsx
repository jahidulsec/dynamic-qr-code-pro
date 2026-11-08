"use client";

import { createContext, use, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { IconTrash, IconX } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccess } from "@/features/organizations";
import { trashQrCodesAction } from "@/features/qr/actions/manage-qr";

type SelectionContextValue = {
  selected: number[];
  allSelected: boolean;
  isSelected: (id: number) => boolean;
  toggle: (id: number, checked: boolean) => void;
  toggleAll: (checked: boolean) => void;
  clear: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

const useSelection = () => {
  const context = use(SelectionContext);
  if (!context) throw new Error("QR selection components must be used inside <QrTableSelection>");
  return context;
};

type QrTableSelectionProps = {
  // ids on the current page; selection never reaches past them
  ids: number[];
  children: React.ReactNode;
};

export function QrTableSelection({ ids, children }: QrTableSelectionProps) {
  const [picked, setPicked] = useState<number[]>([]);

  const value = useMemo<SelectionContextValue>(() => {
    // rows that left the page (trashed, filtered, paged away) drop out of the selection
    const visible = new Set(ids);
    const selected = picked.filter((id) => visible.has(id));
    const selectedSet = new Set(selected);

    return {
      selected,
      allSelected: ids.length > 0 && selected.length === ids.length,
      isSelected: (id) => selectedSet.has(id),
      toggle: (id, checked) =>
        setPicked((current) => (checked ? [...current, id] : current.filter((value) => value !== id))),
      toggleAll: (checked) => setPicked(checked ? ids : []),
      clear: () => setPicked([]),
    };
  }, [ids, picked]);

  return <SelectionContext value={value}>{children}</SelectionContext>;
}

// selecting rows only serves bulk trashing, so it's hidden from members who can't trash
const useCanSelect = () => useAccess().can({ qr: ["trash"] });

export function QrSelectAllCheckbox() {
  const { selected, allSelected, toggleAll } = useSelection();
  if (!useCanSelect()) return null;

  return (
    <Checkbox
      aria-label="Select all QR codes on this page"
      checked={allSelected}
      indeterminate={selected.length > 0 && !allSelected}
      onCheckedChange={(checked) => toggleAll(checked)}
    />
  );
}

export function QrRowCheckbox({ id, name }: { id: number; name: string }) {
  const { isSelected, toggle } = useSelection();
  if (!useCanSelect()) return null;

  return (
    <Checkbox
      aria-label={`Select ${name}`}
      checked={isSelected(id)}
      onCheckedChange={(checked) => toggle(id, checked)}
    />
  );
}

export function QrBulkActions({ organizationSlug }: { organizationSlug: string }) {
  const { selected, clear } = useSelection();
  const [isPending, startTransition] = useTransition();

  if (!selected.length) return null;

  const trashSelected = () =>
    startTransition(async () => {
      const result = await trashQrCodesAction(organizationSlug, selected);
      if (result.success) {
        toast.success(result.message);
        clear();
      } else toast.error(result.message);
    });

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex items-center gap-2 border-t bg-muted/50 px-4 py-2 text-sm"
    >
      <span className="font-medium tabular-nums">{selected.length} selected</span>
      <Button variant="ghost" size="sm" onClick={clear} disabled={isPending}>
        <IconX data-icon="inline-start" />
        Clear
      </Button>
      <Button variant="destructive" size="sm" className="ml-auto" onClick={trashSelected} disabled={isPending}>
        <IconTrash data-icon="inline-start" />
        {isPending ? "Moving…" : "Move to trash"}
      </Button>
    </div>
  );
}
