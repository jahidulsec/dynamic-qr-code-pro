"use client";

import Link from "next/link";
import { useTransition } from "react";
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

type QrRowActionsProps = {
  organizationSlug: string;
  qr: { id: number; name: string; destination: string; status: "ACTIVE" | "PAUSED" };
  editHref: string;
  statsHref: string;
};

export function QrRowActions({ organizationSlug, qr, editHref, statsHref }: QrRowActionsProps) {
  const [isPending, startTransition] = useTransition();

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
        render={<Link href={editHref} scroll={false} />}
        nativeButton={false}
      >
        <IconPencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Analytics for ${qr.name}`}
        render={<Link href={statsHref} scroll={false} />}
        nativeButton={false}
      >
        <IconChartBar />
      </Button>
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
    </div>
  );
}
