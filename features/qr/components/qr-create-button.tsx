"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { QrFormDialog } from "@/features/qr/components/qr-form-dialog";

type QrCreateButtonProps = Omit<ComponentProps<typeof Button>, "onClick" | "children"> & {
  organizationSlug: string;
  baseUrl: string;
  tags: string[];
  /** button label */
  children?: ReactNode;
  /** dialog heading */
  title?: ReactNode;
};

export function QrCreateButton({
  organizationSlug,
  baseUrl,
  tags,
  children = "Generate QR",
  title,
  ...props
}: QrCreateButtonProps) {
  const [open, setOpen] = useState(false);
  // a fresh key per opening resets the form while keeping the close animation
  const [formKey, setFormKey] = useState(0);

  const openDialog = () => {
    setFormKey((key) => key + 1);
    setOpen(true);
  };

  return (
    <>
      <Button {...props} onClick={openDialog}>
        <IconPlus data-icon="inline-start" />
        {children}
      </Button>

      {formKey > 0 && (
        <QrFormDialog
          key={formKey}
          organizationSlug={organizationSlug}
          baseUrl={baseUrl}
          tags={tags}
          title={title}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
