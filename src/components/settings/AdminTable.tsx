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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, MessageSquareOff, Trash } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import Tooltips from "@/components/tooltips/Tooltips";
import QrForm from "@/components/dashboard/QrForm";
import { deleteQr } from "@/app/actions/qr";
import { Admin } from "@prisma/client";
import AdminForm from "./AdminForm";
import { deleteAdmin } from "@/app/actions/admin";
import { table } from "console";

export default function AdminTable({ admin }: { admin: Admin[] }) {
  const [edit, setEdit] = useState<any>();
  const [del, setDel] = useState<any>();
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {admin.length > 0 ? (
            admin.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell># {index + 1}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.username}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <Tooltips title="Edit">
                    <Button
                      size={"icon"}
                      variant={"outline"}
                      className="rounded-full size-8"
                      onClick={() => setEdit(item)}
                    >
                      <Edit className="size-4" />
                    </Button>
                  </Tooltips>
                  <Tooltips title="Move to trash">
                    <Button
                      size={"icon"}
                      variant={"destructive"}
                      className="rounded-full size-8"
                      onClick={() => setDel(item.id)}
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
      <Dialog open={edit} onOpenChange={setEdit}>
        <DialogContent className="w-[75vw] p-0 ">
          <ScrollArea className="max-h-[85vh] px-6 my-6">
            <DialogHeader>
              <DialogTitle className="text-sm font-cb">Edit Admin</DialogTitle>
            </DialogHeader>
            <AdminForm admin={edit} onClose={() => setEdit(false)} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* alert delete vehicle modal */}
      <AlertDialog open={!!del} onOpenChange={setDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              Doctor and remove data from servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const data = await deleteAdmin(del);
                  if (data.toast) {
                    toast.error(data.toast);
                  } else if (data.success) {
                    toast.success(data.success);
                  } else {
                    toast.error(data.error);
                  }
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
