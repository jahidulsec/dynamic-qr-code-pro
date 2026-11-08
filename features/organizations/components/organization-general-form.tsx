"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { IconPhoto } from "@tabler/icons-react";

import { FormButton } from "@/components/shared/button/button";
import { SectionCardHeader, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PENDING_ACTION_MESSAGE } from "@/features/organizations/libs/settings-types";
import {
  createOrganizationSchema,
  type CreateOrganizationValues,
} from "@/features/organizations/schemas/create-organization-schema";

type OrganizationGeneralFormProps = {
  organization: { name: string; slug: string; logo: string | null };
  /** owners and admins can edit; everyone else sees the details read-only */
  canEdit: boolean;
};

export function OrganizationGeneralForm({ organization, canEdit }: OrganizationGeneralFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: organization.name, slug: organization.slug },
  });

  const [name, slug] = useWatch({ control, name: ["name", "slug"] });
  const slugChanged = slug !== organization.slug;

  const onSubmit = handleSubmit(async () => {
    // TODO: updateOrganizationAction, then redirect when the slug changed
    toast.info(PENDING_ACTION_MESSAGE);
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col">
      <SectionCardHeader>
        <SectionLabel>Organization details</SectionLabel>
        {!canEdit && <SectionMeta>Read-only</SectionMeta>}
      </SectionCardHeader>

      <div className="flex flex-col gap-6 p-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 rounded-xl after:rounded-xl">
            <AvatarImage src={organization.logo ?? undefined} alt="" className="rounded-xl" />
            <AvatarFallback className="rounded-xl bg-foreground text-2xl font-semibold text-background">
              {(name || organization.name).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-sm font-medium">Logo</p>
            <Button type="button" variant="outline" size="sm" disabled className="w-fit">
              <IconPhoto data-icon="inline-start" />
              Upload logo
            </Button>
            <p className="text-xs text-muted-foreground">Logo uploads aren&apos;t supported yet.</p>
          </div>
        </div>

        <FieldGroup className="grid gap-6 md:grid-cols-2">
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="organization-name">Organization name</FieldLabel>
                <Input
                  {...field}
                  id="organization-name"
                  autoComplete="organization"
                  readOnly={!canEdit}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>Shown in the sidebar and in invitation emails.</FieldDescription>
                )}
              </Field>
            )}
          />

          <Controller
            name="slug"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="organization-slug">URL</FieldLabel>
                <Input
                  {...field}
                  id="organization-slug"
                  autoComplete="off"
                  spellCheck={false}
                  readOnly={!canEdit}
                  aria-invalid={fieldState.invalid}
                  onChange={(event) => field.onChange(event.target.value.toLowerCase())}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>
                    {slugChanged
                      ? "Old dashboard links stop working. QR short links aren't affected."
                      : <>Your workspace lives at <span className="font-medium text-foreground">/{slug}</span></>}
                  </FieldDescription>
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      {canEdit && (
        <footer className="flex flex-col gap-3 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{isDirty ? "You have unsaved changes." : "Changes apply for every member."}</span>
          <div className="flex gap-2 sm:justify-end">
            {isDirty && (
              <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => reset()}>
                Discard
              </Button>
            )}
            <FormButton type="submit" isPending={isSubmitting} disabled={!isDirty}>
              Save changes
            </FormButton>
          </div>
        </footer>
      )}
    </form>
  );
}
