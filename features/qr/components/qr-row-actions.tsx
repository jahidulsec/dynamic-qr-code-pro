"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  IconChartBar,
  IconDotsVertical,
  IconScan,
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
import { QrCheckDialog } from "@/features/qr/components/qr-check-dialog";
import { QrExportButton } from "@/features/qr/components/qr-export-button";
import { QrFormDialog } from "@/features/qr/components/qr-form-dialog";
import type { QrCheckState } from "@/features/qr/components/qr-test-scan-button";
import type { QrFormInput, QrStyle } from "@/features/qr/schemas/qr-schema";

type QrRowActionsProps = {
  organizationSlug: string;
  qr: { id: number; name: string; slug: string; destination: string; status: "ACTIVE" | "PAUSED"; tags: string[] };
  // check dialog inputs
  check: { state: QrCheckState; createdBy: string; scanCount: number; createdLabel: string };
  // the encoded short link and saved style, used by the check dialog and export menu
  qrValue: string;
  qrLabel: string;
  qrStyle: QrStyle;
  // edit dialog inputs
  baseUrl: string;
  tags: string[];
  editValues: QrFormInput;
};

export function QrRowActions({
  organizationSlug,
  qr,
  check,
  qrValue,
  qrLabel,
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

  const [checkOpen, setCheckOpen] = useState(false);
  // same per-opening key, so the scan counter restarts from the latest saved count
  const [checkKey, setCheckKey] = useState(0);

  const openCheck = () => {
    setCheckKey((key) => key + 1);
    setCheckOpen(true);
  };

  const run = (action: () => Promise<{ success: boolean; message: string }>) =>
    startTransition(async () => {
      const result = await action();
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
        onClick={openCheck}
      >
        <IconScan data-icon="inline-start" />
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
        qr={{ id: qr.id, name: qr.name, tags: qr.tags }}
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

      {checkKey > 0 && (
        <QrCheckDialog
          key={checkKey}
          qr={{
            id: qr.id,
            name: qr.name,
            destination: qr.destination,
            tags: qr.tags,
            createdBy: check.createdBy,
            scanCount: check.scanCount,
          }}
          state={check.state}
          createdLabel={check.createdLabel}
          qrValue={qrValue}
          qrLabel={qrLabel}
          qrStyle={qrStyle}
          open={checkOpen}
          onOpenChange={setCheckOpen}
          onEditUrl={() => {
            setCheckOpen(false);
            openEdit();
          }}
        />
      )}

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
