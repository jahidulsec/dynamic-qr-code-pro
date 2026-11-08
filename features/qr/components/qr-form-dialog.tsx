"use client";

import { useDeferredValue, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import {
  IconAddressBook,
  IconApps,
  IconCheck,
  IconFileTypePdf,
  IconLink,
  IconShare,
  IconWifi,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { FormButton } from "@/components/shared/button/button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MultiCombobox } from "@/components/shared/combobox/multi-combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createQrAction, updateQrAction } from "@/features/qr/actions/save-qr";
import { DEFAULT_QR_FRAME, type QrFrame } from "@/features/qr/components/qr-code-image";
import { QrFrameFields } from "@/features/qr/components/qr-frame-fields";
import { QrPreview } from "@/features/qr/components/qr-preview";
import {
  DEFAULT_QR_STYLE,
  QR_DOT_STYLES,
  QR_FINDER_STYLES,
  qrFormSchema,
  type QrFormInput,
  type QrFormValues,
} from "@/features/qr/schemas/qr-schema";
import { randomSlug, shortLink, shortLinkLabel } from "@/utils/format";
import { slugify } from "@/features/organizations";
import { cn } from "@/lib/utils";

const DESTINATION_TYPES = [
  { label: "Website", icon: IconLink, available: true },
  { label: "vCard", icon: IconAddressBook, available: false },
  { label: "PDF", icon: IconFileTypePdf, available: false },
  { label: "Bio Link", icon: IconShare, available: false },
  { label: "App Store", icon: IconApps, available: false },
  { label: "Wi-Fi", icon: IconWifi, available: false },
];

const toItems = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()) }));

// tags are stored uppercase, so offer the typed text the way it will be saved
const toTagName = (input: string) => input.trim().toUpperCase().slice(0, 32);

// an array field reports one error for the whole list, or one per tag
const tagErrors = (error: unknown): { message?: string }[] => {
  if (!error || typeof error !== "object") return [];
  if ("message" in error && typeof error.message === "string") return [{ message: error.message }];
  return Object.values(error).flatMap(tagErrors);
};

const dotItems = toItems(QR_DOT_STYLES);
const finderItems = toItems(QR_FINDER_STYLES);

// errors on a hidden tab would otherwise go unnoticed, so jump to the first tab that has one
const firstTabWithError = (errors: FieldErrors<QrFormInput>) => {
  if (errors.name || errors.destination || errors.slug || errors.tags) return "target";
  if (errors.style) return "style";
  return "security";
};

type QrFormDialogProps = {
  organizationSlug: string;
  baseUrl: string;
  tags: string[];
  /** set when editing an existing code */
  qr?: { id: number; values: QrFormInput };
  /** overrides the default "Create new dynamic QR" / "Edit QR # id" heading */
  title?: ReactNode;
  /** controlled open state; omit for dialogs that are only mounted while open */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** where to navigate on close when the dialog is driven by a search param */
  closeHref?: string;
};

export function QrFormDialog({
  organizationSlug,
  baseUrl,
  tags,
  qr,
  title,
  open = true,
  onOpenChange,
  closeHref,
}: QrFormDialogProps) {
  const router = useRouter();
  const isEdit = !!qr;
  // the alias follows the name until the user edits it directly
  const slugEdited = useRef(isEdit);
  const [initialSlug] = useState(randomSlug);
  const [tab, setTab] = useState("target");
  // local only: frames and logos decorate the preview and downloads, never the saved code
  const [frame, setFrame] = useState<QrFrame>(DEFAULT_QR_FRAME);
  const deferredFrame = useDeferredValue(frame);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting, isSubmitted },
  } = useForm<QrFormInput, unknown, QrFormValues>({
    resolver: zodResolver(qrFormSchema),
    defaultValues: qr?.values ?? {
      name: "",
      destination: "https://",
      slug: initialSlug,
      tags: [],
      expiresAt: "",
      style: DEFAULT_QR_STYLE,
    },
  });

  const slug = useWatch({ control, name: "slug" });
  const style = useDeferredValue(useWatch({ control, name: "style" }));
  const name = useWatch({ control, name: "name" });

  const close = () => {
    if (onOpenChange) onOpenChange(false);
    else if (closeHref) router.push(closeHref, { scroll: false });
  };

  const onSubmit = handleSubmit(
    async (values) => {
      const result = isEdit
        ? await updateQrAction(organizationSlug, qr.id, values)
        : await createQrAction(organizationSlug, values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      close();
    },
    (errors) => setTab(firstTabWithError(errors)),
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-4xl">
        <form noValidate onSubmit={onSubmit} className="grid md:grid-cols-[1fr_20rem]">
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Dynamic QR generator
                </span>
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  302 redirect
                </Badge>
              </div>
              <DialogTitle className="text-lg">{title ?? (isEdit ? `Edit QR # ${qr.id}` : "Create new dynamic QR")}</DialogTitle>
              <DialogDescription className="sr-only">
                Set where the code points, how it looks and when it expires.
              </DialogDescription>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium">Destination type</span>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {DESTINATION_TYPES.map(({ label, icon: Icon, available }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={!available}
                    aria-pressed={available}
                    title={available ? label : `${label}: coming soon`}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs transition-colors",
                      available
                        ? "border-primary bg-primary text-primary-foreground"
                        : "cursor-not-allowed text-muted-foreground opacity-60",
                    )}
                  >
                    <Icon className="size-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
              <TabsList variant="line" className="w-full justify-start border-b">
                <TabsTrigger value="target" className="flex-none">
                  Campaign &amp; target
                </TabsTrigger>
                <TabsTrigger value="style" className="flex-none">
                  Frame &amp; style
                </TabsTrigger>
                <TabsTrigger value="security" className="flex-none">
                  Expiry
                </TabsTrigger>
              </TabsList>

              {/* keepMounted so fields on hidden tabs still validate and show their errors */}
              <TabsContent value="target" keepMounted className="pt-4 data-hidden:hidden">
                <FieldGroup className="gap-5">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Campaign name</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          autoComplete="off"
                          placeholder="New Year fb frame Wish Card - Jannat"
                          aria-invalid={fieldState.invalid}
                          onChange={(event) => {
                            field.onChange(event);
                            if (!slugEdited.current) {
                              const next = slugify(event.target.value).slice(0, 64);
                              setValue("slug", next.length >= 3 ? next : initialSlug, { shouldValidate: isSubmitted });
                            }
                          }}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    name="destination"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Destination URL</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="url"
                          inputMode="url"
                          autoComplete="url"
                          placeholder="https://www.example.com/"
                          className="font-mono"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid ? (
                          <FieldError errors={[fieldState.error]} />
                        ) : (
                          <FieldDescription>
                            You can change this at any time without reprinting the code.
                          </FieldDescription>
                        )}
                      </Field>
                    )}
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                      name="slug"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Short alias</FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            autoComplete="off"
                            spellCheck={false}
                            readOnly={isEdit}
                            className="font-mono"
                            aria-invalid={fieldState.invalid}
                            onChange={(event) => {
                              slugEdited.current = event.target.value !== "";
                              field.onChange(event.target.value.toLowerCase());
                            }}
                          />
                          {fieldState.invalid ? (
                            <FieldError errors={[fieldState.error]} />
                          ) : (
                            <FieldDescription className="truncate">
                              {isEdit ? "Printed into the code, so it can't change." : shortLinkLabel(baseUrl, slug || "…")}
                            </FieldDescription>
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name="tags"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Department tags</FieldLabel>
                          <MultiCombobox
                            id={field.name}
                            options={tags}
                            value={field.value}
                            onValueChange={field.onChange}
                            onBlur={field.onBlur}
                            creatable={toTagName}
                            placeholder="e.g. RPL"
                            emptyText="Type to add a tag."
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid ? (
                            <FieldError errors={tagErrors(fieldState.error)} />
                          ) : (
                            <FieldDescription>Pick any number, or type a new tag.</FieldDescription>
                          )}
                        </Field>
                      )}
                    />
                  </div>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="style" keepMounted className="pt-4 data-hidden:hidden">
                <FieldGroup className="gap-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ColorField control={control} name="style.foreground" label="Code colour" />
                    <ColorField control={control} name="style.background" label="Background" />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Controller
                      name="style.dotStyle"
                      control={control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>Dot style</FieldLabel>
                          <Select items={dotItems} value={field.value} onValueChange={(value) => value && field.onChange(value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dotItems.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />
                    <Controller
                      name="style.finderStyle"
                      control={control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel>Corner style</FieldLabel>
                          <Select
                            items={finderItems}
                            value={field.value}
                            onValueChange={(value) => value && field.onChange(value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {finderItems.map((item) => (
                                <SelectItem key={item.value} value={item.value}>
                                  {item.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      )}
                    />
                  </div>
                  <QrFrameFields frame={frame} onChange={setFrame} />
                  <FieldDescription>
                    Keep a dark code on a light background with strong contrast, or some phones won&apos;t scan it.
                  </FieldDescription>
                </FieldGroup>
              </TabsContent>

              <TabsContent value="security" keepMounted className="pt-4 data-hidden:hidden">
                <Controller
                  name="expiresAt"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Expires on</FieldLabel>
                      <div className="flex gap-2">
                        <Input
                          {...field}
                          id={field.name}
                          type="date"
                          className="w-auto"
                          aria-invalid={fieldState.invalid}
                        />
                        {field.value && (
                          <Button type="button" variant="ghost" onClick={() => field.onChange("")}>
                            Clear
                          </Button>
                        )}
                      </div>
                      {fieldState.invalid ? (
                        <FieldError errors={[fieldState.error]} />
                      ) : (
                        <FieldDescription>
                          After this day, scans show an &ldquo;expired&rdquo; page instead of redirecting. Leave empty
                          to never expire.
                        </FieldDescription>
                      )}
                    </Field>
                  )}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex flex-col gap-4 border-t bg-muted/30 p-6 md:border-t-0 md:border-l">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Live preview</span>
            <QrPreview
              value={shortLink(baseUrl, slug || initialSlug)}
              style={style}
              frame={deferredFrame}
              label={shortLinkLabel(baseUrl, slug || initialSlug)}
              fileName={slug || name || "qr-code"}
            />
            <div className="mt-auto flex flex-col gap-2 pt-4">
              <FormButton type="submit" isPending={isSubmitting}>
                <IconCheck data-icon="inline-start" />
                {isEdit ? "Save changes" : "Save & deploy QR"}
              </FormButton>
              <Button type="button" variant="ghost" onClick={close}>
                Discard
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ColorField({
  control,
  name,
  label,
}: {
  control: ReturnType<typeof useForm<QrFormInput, unknown, QrFormValues>>["control"];
  name: "style.foreground" | "style.background";
  label: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <div className="flex gap-2">
            <input
              type="color"
              aria-label={`${label} picker`}
              value={/^#[0-9a-fA-F]{6}$/.test(field.value) ? field.value : "#000000"}
              onChange={(event) => field.onChange(event.target.value)}
              className="h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
            />
            <Input {...field} id={field.name} className="font-mono" maxLength={7} aria-invalid={fieldState.invalid} />
          </div>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
