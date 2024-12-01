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
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Prisma, QrLinks } from "@prisma/client";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Download,
  Edit,
  Folder,
  MessageSquareOff,
  QrCode,
  Trash,
  Undo2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import QRCode from "qrcode.react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Tooltips from "@/components/tooltips/Tooltips";
import { formatNumber } from "@/lib/formatter";
import QrForm from "@/components/dashboard/QrForm";
import db from "../../../db/db";
import { deleteQr, moveQrTrash, restoreQrTrash } from "@/app/actions/qr";
import { usePathname } from "next/navigation";

function QrTable({ qrLinks }: { qrLinks: QrLinks[] }) {
  const [editQr, setEditQr] = useState<any>();
  const [delQr, setdelQr] = useState<any>();
  const [previewQR, setPreviewQR] = useState<any>();

  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleQrDownload = () => {
    const qrCode = document.getElementById("qrCodeEl") as HTMLCanvasElement;
    const qrCodeURL = qrCode
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let aEl = document.createElement("a");
    aEl.href = qrCodeURL;
    aEl.download = `${previewQR != undefined ? previewQR.name : ""}.png`;
    document.body.appendChild(aEl);
    aEl.click();
    document.body.removeChild(aEl);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Qr Text</TableHead>
            <TableHead className="text-center">Viewer&apos;s Count</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {qrLinks.length > 0 ? (
            qrLinks.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.link}</TableCell>
                <TableCell className="text-right">
                  {formatNumber(Number(item.visitedCount))}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
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

      {/* update doctor dialog */}
      <Dialog open={editQr} onOpenChange={setEditQr}>
        <DialogContent className="w-[75vw] p-0 ">
          <ScrollArea className="max-h-[85vh] px-6 my-6">
            <DialogHeader>
              <DialogTitle className="text-sm font-cb">Edit Qr</DialogTitle>
            </DialogHeader>
            <QrForm qrLink={editQr} onClose={() => setEditQr(false)} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* alert delete vehicle modal */}
      <AlertDialog open={!!delQr} onOpenChange={setdelQr}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {pathname === "/admin"
                ? "Do you want to move this QR on trash?"
                : `This action cannot be undone. This will permanently delete this Doctor and remove data from servers.
                    `}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  try {
                    if (pathname === "/admin") {
                      await moveQrTrash(delQr);
                      toast.success("Move to trash successfully");
                    } else {
                      await deleteQr(delQr);
                      toast.success("Deleted successfully");
                    }
                  } catch (error: any) {
                    toast.error(error);
                  }
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* doctor qr code */}
      <Dialog open={previewQR} onOpenChange={setPreviewQR}>
        <DialogContent className="min-w-[18rem] md:max-w-[550px] aspect-square">
          <DialogHeader>
            <DialogTitle className="text-sm font-cb">QR Code</DialogTitle>
          </DialogHeader>

          <div className="justify-center items-center hidden">
            <QRCode
              id="qrCodeEl"
              size={1500}
              includeMargin
              value={`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/qr/${
                previewQR != undefined ? previewQR.id : ""
              }`}
            />
          </div>

          <div className="flex justify-center items-center">
            <QRCode
              size={320}
              value={`${process.env.NEXT_PUBLIC_DOMAIN_NAME}/qr/${
                previewQR != undefined ? previewQR.id : ""
              }`}
            />
          </div>

          <Button type="button" onClick={handleQrDownload}>
            Download
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default QrTable;
