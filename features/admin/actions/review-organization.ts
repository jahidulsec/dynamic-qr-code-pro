"use server";

import { refresh } from "next/cache";

import {
  approveOrganizationSchema,
  organizationIdSchema,
  reviewReasonSchema,
  type ApproveOrganizationValues,
  type ReviewReasonValues,
} from "@/features/admin/schemas/review-organization";
import { requireAdmin } from "@/features/admin/services/admin-session";
import { reviewOrganization } from "@/features/admin/services/review-organization";
import {
  organizationApprovedEmail,
  organizationReactivatedEmail,
  organizationRejectedEmail,
  organizationSuspendedEmail,
  sendToOwners,
} from "@/features/email/server";
import { apiResponse } from "@/utils/response";

// Each action: requireAdmin → parse → one transaction (conditional status update, subscription on approve,
// both audit entries) → owners' email after the commit (logged, never thrown) → refresh().

const adminActor = (session: Awaited<ReturnType<typeof requireAdmin>>) => ({
  id: session.user.id,
  name: session.user.name,
});

/** PENDING or REJECTED → ACTIVE, with a subscription on the chosen plan. Sends the activation email. */
export const approveOrganizationAction = async (organizationId: string, values: ApproveOrganizationValues) => {
  try {
    const session = await requireAdmin();
    const id = organizationIdSchema.parse(organizationId);
    const { planId, status, currentPeriodEnd } = approveOrganizationSchema.parse(values);

    const organization = await reviewOrganization({
      organizationId: id,
      action: "organization.approve",
      admin: adminActor(session),
      subscription: { planId, status, currentPeriodEnd },
    });

    await sendToOwners(
      organization.id,
      organizationApprovedEmail({
        organizationName: organization.name,
        organizationSlug: organization.slug,
        planName: organization.planName ?? "",
      }),
    );

    refresh();
    return apiResponse.single({ message: `${organization.name} approved`, data: { id: organization.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

/** PENDING → REJECTED. The reason is shown to the owners. */
export const rejectOrganizationAction = async (organizationId: string, values: ReviewReasonValues) => {
  try {
    const session = await requireAdmin();
    const id = organizationIdSchema.parse(organizationId);
    const { reason } = reviewReasonSchema.parse(values);

    const organization = await reviewOrganization({
      organizationId: id,
      action: "organization.reject",
      admin: adminActor(session),
      reason,
    });

    await sendToOwners(organization.id, organizationRejectedEmail({ organizationName: organization.name, reason }));

    refresh();
    return apiResponse.single({ message: `${organization.name} rejected`, data: { id: organization.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

/** ACTIVE → SUSPENDED. The organization is locked and its QR codes stop redirecting. */
export const suspendOrganizationAction = async (organizationId: string, values: ReviewReasonValues) => {
  try {
    const session = await requireAdmin();
    const id = organizationIdSchema.parse(organizationId);
    const { reason } = reviewReasonSchema.parse(values);

    const organization = await reviewOrganization({
      organizationId: id,
      action: "organization.suspend",
      admin: adminActor(session),
      reason,
    });

    await sendToOwners(organization.id, organizationSuspendedEmail({ organizationName: organization.name, reason }));

    refresh();
    return apiResponse.single({ message: `${organization.name} suspended`, data: { id: organization.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

/** SUSPENDED → ACTIVE. The existing subscription is kept as it is. */
export const reactivateOrganizationAction = async (organizationId: string) => {
  try {
    const session = await requireAdmin();
    const id = organizationIdSchema.parse(organizationId);

    const organization = await reviewOrganization({
      organizationId: id,
      action: "organization.reactivate",
      admin: adminActor(session),
    });

    await sendToOwners(
      organization.id,
      organizationReactivatedEmail({ organizationName: organization.name, organizationSlug: organization.slug }),
    );

    refresh();
    return apiResponse.single({ message: `${organization.name} reactivated`, data: { id: organization.id } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
