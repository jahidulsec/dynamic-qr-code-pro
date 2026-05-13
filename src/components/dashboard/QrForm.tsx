"use client";

import { addQr, updateQr } from "@/app/actions/qr";
import { QrLinks } from "@prisma/client";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { qrSchema, QrSchemaType } from "@/schemas/qr";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormButton } from "../shared/button/button";
import {
  FieldGroup,
  FieldLabel,
  FieldError,
  Field,
} from "@/components/ui/field";
import { Input } from "../ui/input";

interface qrLinkFormProps {
  qrLink?: Partial<QrLinks>;
  onClose: () => void;
}

export default function QrForm({ onClose, qrLink }: qrLinkFormProps) {
  const form = useForm<QrSchemaType>({
    resolver: zodResolver(qrSchema),
    defaultValues: {
      name: qrLink?.name,
      link: qrLink?.link,
      adminId: qrLink?.adminId ?? "",
    },
  });

  const onSubmit = async (data: QrSchemaType) => {
    const res = qrLink?.id
      ? await updateQr(qrLink?.id, data)
      : await addQr(data);

    toast[res.success ? "success" : "error"](res.message);

    if (res.success) {
      onClose();
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-5 mt-5 px-1"
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="QR name"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="link"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>URL</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Link"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <FormButton isPending={form.formState.isSubmitting}>Submit</FormButton>
    </form>
  );
}
