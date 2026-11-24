"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormButton } from "@/components/shared/button/button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { banUserAction } from "@/features/admin/actions/manage-users";
import { BAN_DURATIONS, type BanDuration } from "@/features/admin/constants";
import { REVIEW_REASON_MAX } from "@/features/admin/schemas/review-organization";
import { banUserSchema, type BanUserValues } from "@/features/admin/schemas/manage-users";

const durationItems = (Object.keys(BAN_DURATIONS) as BanDuration[]).map((value) => ({
  value,
  label: BAN_DURATIONS[value].label,
}));

const DEFAULTS: BanUserValues = { reason: "", duration: "7d" };

export function BanUserDialog({ user }: { user: { id: string; name: string } }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset } = useForm<BanUserValues>({
    resolver: zodResolver(banUserSchema),
    defaultValues: DEFAULTS,
  });

  const onOpenChange = (next: boolean) => {
    if (isPending) return;
    setOpen(next);
    if (next) reset(DEFAULTS);
  };

  const onSubmit = handleSubmit((values) =>
    startTransition(async () => {
      const result = await banUserAction(user.id, values);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setOpen(false);
      toast.success(result.message);
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="ghost" className="text-destructive" />}>Ban</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
          <DialogHeader>
            <DialogTitle>Ban {user.name}</DialogTitle>
            <DialogDescription>
              They&apos;re signed out of every session and can&apos;t sign in until the ban ends or you lift it.
            </DialogDescription>
          </DialogHeader>

          <Controller
            name="reason"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`ban-reason-${user.id}`}>Reason</FieldLabel>
                <Textarea
                  {...field}
                  id={`ban-reason-${user.id}`}
                  rows={3}
                  maxLength={REVIEW_REASON_MAX}
                  autoFocus
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>Kept in the admin audit log.</FieldDescription>
                )}
              </Field>
            )}
          />

          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Expires after</FieldLabel>
                <Select items={durationItems} value={field.value} onValueChange={(value) => value && field.onChange(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durationItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" disabled={isPending} />}>Cancel</DialogClose>
            <FormButton type="submit" variant="destructive" isPending={isPending}>
              Ban and sign out
            </FormButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
