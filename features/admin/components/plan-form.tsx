"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Controller, useForm, useWatch, type Control } from "react-hook-form";
import { toast } from "sonner";

import { FormButton } from "@/components/shared/button/button";
import { Section, SectionCardHeader, SectionLabel } from "@/components/shared/section/section";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPlanAction, updatePlanAction } from "@/features/admin/actions/manage-plans";
import type { AdminPlan } from "@/features/admin/components/plan-table";
import { ADMIN_PATHS } from "@/features/admin/constants";
import {
  planFormFieldsSchema,
  planFormFieldsToInput,
  type PlanFormFields,
} from "@/features/admin/schemas/manage-plans";
import { PLAN_FEATURE_LABELS, PLAN_FEATURES, PLAN_LIMIT_LABELS, PLAN_LIMITS, type PlanLimit } from "@/features/billing";

const LIMIT_FIELDS = { qrCodes: "maxQrCodes", members: "maxMembers", customRoles: "maxCustomRoles" } as const;

const centsToInput = (cents: number) => (cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2));

const defaultsFor = (plan: AdminPlan | null): PlanFormFields => ({
  key: plan?.key ?? "",
  name: plan?.name ?? "",
  description: plan?.description ?? "",
  priceMonthly: plan ? centsToInput(plan.priceMonthly) : "0",
  priceYearly: plan ? centsToInput(plan.priceYearly) : "0",
  currency: plan?.currency ?? "USD",
  maxQrCodes: plan?.maxQrCodes?.toString() ?? "",
  maxMembers: plan?.maxMembers?.toString() ?? "",
  maxCustomRoles: plan?.maxCustomRoles?.toString() ?? "",
  unlimited: {
    qrCodes: plan ? plan.maxQrCodes === null : false,
    members: plan ? plan.maxMembers === null : false,
    customRoles: plan ? plan.maxCustomRoles === null : false,
  },
  features: Object.fromEntries(PLAN_FEATURES.map((feature) => [feature, plan?.features[feature] ?? false])),
  isPublic: plan?.isPublic ?? true,
  sortOrder: String(plan?.sortOrder ?? 0),
});

/** Create (plan null) and edit form for /admin/plans/[id] (spec 04). The key can only be set when creating. */
export function AdminPlanForm({ plan }: { plan: AdminPlan | null }) {
  const router = useRouter();
  const [isSaving, startSaving] = useTransition();
  const isNew = !plan;

  const { control, handleSubmit } = useForm<PlanFormFields>({
    resolver: zodResolver(planFormFieldsSchema),
    defaultValues: defaultsFor(plan),
  });

  const onSubmit = handleSubmit((values) =>
    startSaving(async () => {
      const { key, ...input } = planFormFieldsToInput(values);
      const result = plan ? await updatePlanAction(plan.id, input) : await createPlanAction({ key, ...input });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      if (isNew) router.push(ADMIN_PATHS.plans);
    }),
  );

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      {plan && plan.organizationCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p>
            Changes apply immediately to {plan.organizationCount.toLocaleString()}{" "}
            {plan.organizationCount === 1 ? "organization" : "organizations"} on this plan.
            {plan.isDefault && " As the default plan, it also sets the limits of organizations without a subscription in effect."}
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section>
          <SectionCardHeader>
            <SectionLabel>Details</SectionLabel>
          </SectionCardHeader>
          <FieldGroup className="p-5">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plan-name">Name</FieldLabel>
                  <Input {...field} id="plan-name" maxLength={64} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="key"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plan-key">Key</FieldLabel>
                  <Input
                    {...field}
                    id="plan-key"
                    className="font-mono"
                    maxLength={32}
                    disabled={!isNew}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : (
                    <FieldDescription>
                      {isNew
                        ? "Lowercase letters, digits and dashes. It can't be changed later."
                        : "The key can't be changed."}
                    </FieldDescription>
                  )}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="plan-description">Description</FieldLabel>
                  <Textarea {...field} id="plan-description" rows={2} maxLength={255} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Controller
                name="priceMonthly"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="plan-price-monthly">Monthly price</FieldLabel>
                    <Input {...field} id="plan-price-monthly" inputMode="decimal" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="priceYearly"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="plan-price-yearly">Yearly price</FieldLabel>
                    <Input {...field} id="plan-price-yearly" inputMode="decimal" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="currency"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="plan-currency">Currency</FieldLabel>
                    <Input {...field} id="plan-currency" className="uppercase" maxLength={3} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
            <FieldDescription>Prices are for display only; billing is manual.</FieldDescription>
          </FieldGroup>
        </Section>

        <div className="flex flex-col gap-4">
          <Section>
            <SectionCardHeader>
              <SectionLabel>Limits</SectionLabel>
            </SectionCardHeader>
            <FieldGroup className="p-5">
              {PLAN_LIMITS.map((limit) => (
                <LimitField key={limit} limit={limit} control={control} disabled={isSaving} />
              ))}
            </FieldGroup>
          </Section>

          <Section>
            <SectionCardHeader>
              <SectionLabel>Features and visibility</SectionLabel>
            </SectionCardHeader>
            <FieldGroup className="p-5">
              {PLAN_FEATURES.map((feature) => (
                <Controller
                  key={feature}
                  name={`features.${feature}`}
                  control={control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <Checkbox
                        id={`plan-feature-${feature}`}
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                      <FieldLabel htmlFor={`plan-feature-${feature}`}>{PLAN_FEATURE_LABELS[feature]}</FieldLabel>
                    </Field>
                  )}
                />
              ))}
              <Controller
                name="isPublic"
                control={control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox id="plan-public" checked={field.value} onCheckedChange={field.onChange} disabled={isSaving} />
                    <FieldContent>
                      <FieldLabel htmlFor="plan-public">Public</FieldLabel>
                      <FieldDescription>Listed on a future pricing page.</FieldDescription>
                    </FieldContent>
                  </Field>
                )}
              />
              <Controller
                name="sortOrder"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="plan-sort-order">Sort order</FieldLabel>
                    <Input {...field} id="plan-sort-order" inputMode="numeric" className="max-w-32" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <FieldDescription>Lower numbers are listed first.</FieldDescription>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </Section>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isSaving} onClick={() => router.push(ADMIN_PATHS.plans)}>
          {isNew ? "Cancel" : "Back to plans"}
        </Button>
        <FormButton type="submit" isPending={isSaving}>
          {isNew ? "Create plan" : "Save plan"}
        </FormButton>
      </div>
    </form>
  );
}

function LimitField({ limit, control, disabled }: { limit: PlanLimit; control: Control<PlanFormFields>; disabled: boolean }) {
  const unlimited = useWatch({ control, name: `unlimited.${limit}` });
  const id = `plan-limit-${limit}`;

  return (
    <div className="flex items-start gap-4">
      <Controller
        name={LIMIT_FIELDS[limit]}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="flex-1">
            <FieldLabel htmlFor={id}>{PLAN_LIMIT_LABELS[limit]}</FieldLabel>
            <Input
              {...field}
              id={id}
              inputMode="numeric"
              disabled={unlimited || disabled}
              placeholder={unlimited ? "Unlimited" : undefined}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name={`unlimited.${limit}`}
        control={control}
        render={({ field }) => (
          <Field orientation="horizontal" className="mt-8 w-auto">
            <Checkbox id={`${id}-unlimited`} checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
            <FieldLabel htmlFor={`${id}-unlimited`}>Unlimited</FieldLabel>
          </Field>
        )}
      />
    </div>
  );
}
