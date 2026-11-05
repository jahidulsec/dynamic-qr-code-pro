"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createQrTagAction, renameQrTagAction } from "@/features/qr-tags/actions/save-qr-tag";
import { qrTagFormSchema, type QrTagFormInput, type QrTagFormValues } from "@/features/qr-tags/schemas/qr-tags-schema";

type QrTagFormDialogProps = {
  organizationSlug: string;
  /** the button that opens the dialog */
  trigger: ReactElement;
  /** what the trigger shows */
  children: ReactNode;
  /** set when renaming an existing tag */
  tag?: { id: string; name: string };
};

export function QrTagFormDialog({ organizationSlug, trigger, children, tag }: QrTagFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isRename = !!tag;

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<QrTagFormInput, unknown, QrTagFormValues>({
    resolver: zodResolver(qrTagFormSchema),
    defaultValues: { name: tag?.name ?? "" },
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    // start fresh every time the dialog opens
    if (next) reset({ name: tag?.name ?? "" });
  };

  const onSubmit = handleSubmit(async (values) => {
    const result = isRename
      ? await renameQrTagAction(organizationSlug, tag.id, values)
      : await createQrTagAction(organizationSlug, values);

    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>{isRename ? `Rename ${tag.name}` : "New department tag"}</DialogTitle>
            <DialogDescription>
              {isRename
                ? "Every QR code with this tag shows the new name."
                : "Group QR codes by department, campaign or location."}
            </DialogDescription>
          </DialogHeader>

          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="off"
                  autoFocus
                  placeholder="e.g. RPL"
                  className="uppercase"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>Up to 32 characters, saved in capitals.</FieldDescription>
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isRename ? "Save" : "Create tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
