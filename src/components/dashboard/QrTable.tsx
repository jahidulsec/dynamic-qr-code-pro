"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, MessageSquareOff, QrCode, Trash, Undo2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import Tooltips from "@/components/tooltips/Tooltips";
import { formatNumber } from "@/lib/formatter";
import QrForm from "@/components/dashboard/QrForm";
import { deleteQr, moveQrTrash, restoreQrTrash } from "@/app/actions/qr";
import { usePathname, useSearchParams } from "next/navigation";
import { QrTableProps } from "@/app/admin/page";
import { format as dateFormat } from "date-fns";
import QRPreviewSection from "./QrPreviewSection";
import useHost from "@/hooks/useHost";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

function QrTable({
  qrLinks,
  limit,
  count,
}: {
  qrLinks: QrTableProps[];
  limit: number;
  count: number;
}) {
  const [editQr, setEditQr] = useState<any>();
  const [delQr, setdelQr] = useState<any>();
  const [previewQR, setPreviewQR] = useState<any>();
  const { hostname } = useHost();

  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      <Table className="[&_th]:text-nowrap [&_td]:border [&_td]:border-muted-foreground [&_th]:border [&_th]:border-muted-foreground [&_th]:text-center">
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Embedded URL</TableHead>
            <TableHead>Viewer&apos;s Count</TableHead>
            <TableHead>Created by</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {qrLinks.length > 0 ? (
            qrLinks.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="text-nowrap">
                  #{" "}
                  {count +
                    1 -
                    ((searchParams.has("p")
                      ? Number(searchParams.get("p")) - 1
                      : 0) *
                      limit +
                      (index + 1))}
                </TableCell>
                <TableCell className="min-w-[13.5rem] text-center">
                  {item.name}
                </TableCell>
                <TableCell>{item.link}</TableCell>
                <TableCell className="text-center">
                  {formatNumber(Number(item.visitedCount))}
                </TableCell>
                <TableCell className="text-center text-nowrap">
                  {item.admin?.name}
                </TableCell>
                <TableCell className="text-center">
                  {dateFormat(item.createdAt, "LLL dd, yyyy (eeee)")}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    {pathname === "/admin" && (
                      <>
                        {" "}
                        <Tooltips title="QR Code">
                          <Button
                            size={"icon"}
                            variant={"outline"}
                            className="rounded-full size-8"
                            onClick={() => {
                              setPreviewQR(item);
                            }}
                          >
                            <QrCode className="size-4" />
                          </Button>
                        </Tooltips>
                        <Tooltips title="Edit">
                          <Button
                            size={"icon"}
                            variant={"outline"}
                            className="rounded-full size-8"
                            onClick={() => setEditQr(item)}
                          >
                            <Edit className="size-4" />
                          </Button>
                        </Tooltips>
                      </>
                    )}
                    {pathname !== "/admin" && (
                      <Tooltips title="Restore">
                        <Button
                          size={"icon"}
                          variant={"outline"}
                          className="rounded-full size-8"
                          onClick={async () => {
                            try {
                              await restoreQrTrash(item.id);
                              toast.success("QR is restored!");
                            } catch (error: any) {
                              toast.error(error);
                            }
                          }}
                        >
                          <Undo2 className="size-4" />
                        </Button>
                      </Tooltips>
                    )}
                    <Tooltips title="Move to trash">
                      <Button
                        size={"icon"}
                        variant={"destructive"}
                        className="rounded-full size-8"
                        onClick={() => setdelQr(item.id)}
                      >
                        <Trash className="size-4" />
                      </Button>
                    </Tooltips>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
                className="py-20 text-gray-400 pointer-events-none"
              >
                <MessageSquareOff className="size-10" />
                <span className="text-[11px]">No data</span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* update qr dialog */}
      <Sheet open={editQr} onOpenChange={setEditQr}>
        <SheetContent className="w-[75vw] p-0 ">
          <ScrollArea className="max-h-[85vh] px-6 my-6">
            <SheetHeader>
              <SheetTitle className="text-sm font-cb">Edit Qr</SheetTitle>
            </SheetHeader>
            <QrForm qrLink={editQr} onClose={() => setEditQr(false)} />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* alert delete qr modal */}
      <AlertDialog open={!!delQr} onOpenChange={setdelQr}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {pathname === "/admin"
                ? "Do you want to move this QR on trash?"
                : `This action cannot be undone. This will permanently delete this qr and remove data from servers.
                    `}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  if (pathname === "/admin") {
                    const data = await moveQrTrash(delQr);
                    if (data.toast) {
                      toast.error(data.toast);
                    } else if (data.success) {
                      toast.success(data.success);
                    } else {
                      toast.error(data.error);
                    }
                  } else {
                    const data = await deleteQr(delQr);
                    if (data.toast) {
                      toast.error(data.toast);
                    } else if (data.success) {
                      toast.success(data.success);
                    } else {
                      toast.error(data.error);
                    }
                  }
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* preview qr code */}
      <Sheet open={previewQR} onOpenChange={setPreviewQR}>
        <SheetContent className="min-w-[18rem] md:max-w-[550px] aspect-square overflow-hidden">
          <SheetHeader>
            <SheetTitle className="text-sm font-cb">QR Code</SheetTitle>
          </SheetHeader>

          <QRPreviewSection
            data={`${hostname}/qr/${
              previewQR != undefined ? previewQR.id : ""
            }`}
            name={previewQR?.name ?? "QR"}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

export default QrTable;
