"use client";

import Link from "next/link";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { FormButton } from "@/components/shared/button/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createOrganizationAction } from "@/features/organizations/actions/create-organization";
import {
  createOrganizationSchema,
  slugify,
  type CreateOrganizationValues,
} from "@/features/organizations/schemas/create-organization-schema";
import { cn } from "@/lib/utils";

type CreateOrganizationFormProps = React.ComponentProps<"form"> & { canGoBack?: boolean };

export function CreateOrganizationForm({ canGoBack = false, className, ...props }: CreateOrganizationFormProps) {
  // the URL follows the name until the user edits it directly
  const slugEdited = useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isSubmitted },
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "", slug: "" },
  });

  const slug = useWatch({ control, name: "slug" });

  const onSubmit = handleSubmit(async (values) => {
    // redirects to the new organization on success
    const result = await createOrganizationAction(values);
    if (!result.success) toast.error(result.message);
  });

  return (
    <form noValidate onSubmit={onSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Organization name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                autoComplete="organization"
                placeholder="Acme Inc."
                aria-invalid={fieldState.invalid}
                onChange={(event) => {
                  field.onChange(event);
                  if (!slugEdited.current)
                    setValue("slug", slugify(event.target.value), { shouldValidate: isSubmitted });
                }}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>URL</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="acme"
                aria-invalid={fieldState.invalid}
                onChange={(event) => {
                  slugEdited.current = event.target.value !== "";
                  field.onChange(event.target.value.toLowerCase());
                }}
              />
              {fieldState.invalid ? (
                <FieldError errors={[fieldState.error]} />
              ) : (
                <FieldDescription>
                  Your workspace will live at <span className="font-medium text-foreground">/{slug || "acme"}</span>
                </FieldDescription>
              )}
            </Field>
          )}
        />

        <Field>
          <FormButton type="submit" isPending={isSubmitting}>
            Create organization
          </FormButton>
          {canGoBack && (
            <FieldDescription className="text-center">
              <Link href="/organizations">Back to organizations</Link>
            </FieldDescription>
          )}
        </Field>
      </FieldGroup>
    </form>
  );
}
