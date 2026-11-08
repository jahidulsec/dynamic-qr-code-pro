"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { IconDoorExit, IconTrashX } from "@tabler/icons-react";

import { SectionCardHeader, SectionLabel } from "@/components/shared/section/section";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { deleteOrganizationAction } from "@/features/organizations/actions/manage-organization";
import { PENDING_ACTION_MESSAGE } from "@/features/organizations/libs/settings-types";

type OrganizationDangerZoneProps = {
  organization: { name: string; slug: string };
  canDelete: boolean;
  /** false for the last owner, who must hand over ownership or delete instead */
  canLeave: boolean;
};

function DangerRow({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

export function OrganizationDangerZone({ organization, canDelete, canLeave }: OrganizationDangerZoneProps) {
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, startDeleting] = useTransition();

  // TODO: leaveOrganizationAction, then redirect to /organizations
  const pending = () => toast.info(PENDING_ACTION_MESSAGE);

  // the dialog stays open while the request runs; success redirects to /organizations
  const deleteOrganization = () =>
    startDeleting(async () => {
      const result = await deleteOrganizationAction(organization.slug, confirmation);
      if (!result.success) toast.error(result.message);
    });

  return (
    <div className="flex flex-col">
      <SectionCardHeader>
        <SectionLabel className="text-destructive">Danger zone</SectionLabel>
      </SectionCardHeader>
      <div className="flex flex-col divide-y">
        <DangerRow
          title="Leave organization"
          description={
            canLeave
              ? "You lose access to its QR codes and reports. An admin can invite you back."
              : "You're the only owner. Make someone else an owner before you leave."
          }
          action={
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="outline" disabled={!canLeave} />}>
                <IconDoorExit data-icon="inline-start" />
                Leave
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave {organization.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You lose access straight away. The QR codes you created stay with the organization.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={pending}>
                    Leave organization
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          }
        />

        {canDelete && (
          <DangerRow
            title="Delete organization"
            description="Permanently deletes every QR code, tag and scan. Short links stop working."
            action={
              <AlertDialog onOpenChange={(open) => open && setConfirmation("")}>
                <AlertDialogTrigger render={<Button variant="destructive" />}>
                  <IconTrashX data-icon="inline-start" />
                  Delete
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {organization.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This can&apos;t be undone. All QR codes, tags, scans and members are removed, and printed codes
                      stop redirecting.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Field>
                    <FieldLabel htmlFor="delete-confirmation">
                      Type <span className="font-mono font-semibold">{organization.slug}</span> to confirm
                    </FieldLabel>
                    <Input
                      id="delete-confirmation"
                      autoComplete="off"
                      spellCheck={false}
                      value={confirmation}
                      disabled={isDeleting}
                      onChange={(event) => setConfirmation(event.target.value)}
                    />
                  </Field>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      disabled={confirmation !== organization.slug || isDeleting}
                      onClick={deleteOrganization}
                    >
                      {isDeleting ? "Deleting…" : "Delete organization"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            }
          />
        )}
      </div>
    </div>
  );
}
