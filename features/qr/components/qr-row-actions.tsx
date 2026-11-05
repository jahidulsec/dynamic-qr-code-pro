"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  IconChartBar,
  IconDotsVertical,
  IconExternalLink,
  IconPencil,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setQrStatusAction, trashQrAction } from "@/features/qr/actions/manage-qr";
import { QrAnalyticsButton } from "@/features/qr/components/qr-analytics-button";
import { QrExportButton } from "@/features/qr/components/qr-export-button";
import { QrFormDialog } from "@/features/qr/components/qr-form-dialog";
import type { QrFormInput, QrStyle } from "@/features/qr/schemas/qr-schema";

type QrRowActionsProps = {
  organizationSlug: string;
  qr: { id: number; name: string; slug: string; destination: string; status: "ACTIVE" | "PAUSED"; tag: string | null };
  // the encoded short link and saved style, used by the export menu
  qrValue: string;
  qrStyle: QrStyle;
  // edit dialog inputs
  baseUrl: string;
  tags: string[];
  editValues: QrFormInput;
};

export function QrRowActions({
  organizationSlug,
  qr,
  qrValue,
  qrStyle,
  baseUrl,
  tags,
  editValues,
}: QrRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  // a fresh key per opening resets the form to the latest saved values while keeping the close animation
  const [editKey, setEditKey] = useState(0);

  const openEdit = () => {
    setEditKey((key) => key + 1);
    setEditOpen(true);
  };

  const run = (action: () => Promise<{ success: boolean; message: string }>) =>
    startTransition(async () => {
      const result = await action();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });

  return (
    <div className="flex items-center justify-end gap-1">
      {/* opens the destination directly, so checking a link never counts as a scan */}
      <Button
        variant="ghost"
        size="sm"
        className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
        render={<a href={qr.destination} target="_blank" rel="noopener noreferrer" />}
        nativeButton={false}
      >
        <IconExternalLink data-icon="inline-start" />
        Check
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${qr.name}`}
        onClick={openEdit}
      >
        <IconPencil />
      </Button>
      <QrAnalyticsButton
        organizationSlug={organizationSlug}
        qr={{ id: qr.id, name: qr.name, tag: qr.tag }}
        variant="ghost"
        size="icon-sm"
        aria-label={`Analytics for ${qr.name}`}
      >
        <IconChartBar />
      </QrAnalyticsButton>
      <QrExportButton value={qrValue} style={qrStyle} fileName={qr.slug} label={qr.name} />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`More actions for ${qr.name}`} disabled={isPending} />}
        >
          <IconDotsVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={() =>
              run(() => setQrStatusAction(organizationSlug, qr.id, qr.status === "ACTIVE" ? "PAUSED" : "ACTIVE"))
            }
          >
            {qr.status === "ACTIVE" ? <IconPlayerPause /> : <IconPlayerPlay />}
            {qr.status === "ACTIVE" ? "Pause" : "Resume"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => run(() => trashQrAction(organizationSlug, qr.id))}>
            <IconTrash />
            Move to trash
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {editKey > 0 && (
        <QrFormDialog
          key={editKey}
          organizationSlug={organizationSlug}
          baseUrl={baseUrl}
          tags={tags}
          qr={{ id: qr.id, values: editValues }}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
    </div>
  );
}
