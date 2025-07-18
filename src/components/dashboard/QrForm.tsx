"use client";

import { addQr, updateQr } from "@/app/actions/qr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrLinks } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import React, { useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

interface qrLinkFormProps {
  qrLink?: QrLinks;
  onClose: () => void;
}

export default function QrForm({ onClose, qrLink }: qrLinkFormProps) {
  const [data, action] = useFormState(
    qrLink == null ? addQr : updateQr.bind(null, qrLink.id),
    null
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
    <form action={action} className="flex flex-col gap-5 mt-5 px-1">
      <p className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={qrLink != null ? qrLink.name : ""}
        />
        {data?.error != null && data?.error.name && (
          <i className="error-msg">{data.error.name}</i>
        )}
      </p>
      <p className="flex flex-col gap-2 w-full">
        <Label htmlFor="link">URL</Label>
        <Input
          id="link"
          name="link"
          defaultValue={qrLink != null ? (qrLink.link as string) : ""}
        />
        {data?.error != null && data?.error.link && (
          <i className="error-msg">{data.error.link}</i>
        )}
      </p>

      <SubmitButton />
    </form>
  );
}

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <Button className="col-span-2" type="submit" disabled={pending}>
      {pending ? `Saving...` : `Save`}
    </Button>
  );
};
