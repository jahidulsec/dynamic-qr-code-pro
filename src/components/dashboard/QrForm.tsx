"use client";

import { addQr, updateQr } from "@/app/actions/qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrLinks } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import React, { useActionState, useEffect } from "react";
import { toast } from "sonner";

interface qrLinkFromProps {
  qrLink?: QrLinks;
  onClose: () => void;
}

export default function QrForm({ onClose, qrLink }: qrLinkFromProps) {
  const [data, action, isPending] = useActionState(
    qrLink == null ? addQr : updateQr.bind(null, qrLink.id),
    null,
  );

  useEffect(() => {
    if (data?.toast != null) {
      toast.error(data.toast);
    } else if (data?.success) {
      toast.success(data.success);
      onClose();
    }
  }, [data]);

  return (
    <>
      <form action={action} className="grid grid-cols-1 gap-5 mt-5 px-1">
        <p className="flex flex-col gap-2 col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={qrLink != null ? qrLink.name : ""}
          />
          {data?.error != null && data?.error.name && (
            <p className="error-msg">{data.error.name}</p>
          )}
        </p>
        <p className="flex flex-col gap-2">
          <Label htmlFor="link">URL</Label>
          <Input
            id="link"
            name="link"
            defaultValue={qrLink != null ? (qrLink.link as string) : ""}
          />
          {data?.error != null && data?.error.link && (
            <p className="error-msg">{data.error.link}</p>
          )}
        </p>

        <SubmitButton pending={isPending} />
      </form>
    </>
  );
}

const SubmitButton = ({ pending }: { pending: boolean }) => {
  return (
    <Button className="col-span-2" type="submit" disabled={pending}>
      {pending ? `Saving...` : `Save`}
    </Button>
  );
};
