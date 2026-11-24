import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site";
import { BillingOverview, type BillingUsage } from "@/features/billing";
import { getEntitlements } from "@/features/billing/server";
import { PAGE_TITLES } from "@/features/dashboard";
import { getAccess, toInvitationRows } from "@/features/organizations/server";
import { getQrCount } from "@/features/qr";
import { MAX_CUSTOM_ROLES } from "@/lib/auth/auth";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = {
  title: `${PAGE_TITLES.billing} · ${PAGE_TITLES.settings}`,
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

// read-only and open to every member
export default async function BillingSettingsPage({ params }: PageProps<"/[organizationSlug]/settings/billing">) {
  const { organizationSlug } = await params;
  const access = await getAccess(organizationSlug);
  if (!access) notFound();

  const { organization, roles } = access;
  const [entitlements, qrCount] = await Promise.all([getEntitlements(organization.id), getQrCount(organizationSlug)]);

  // counted the way the limit checks count: live QR codes; members plus pending, unexpired invitations
  const members = organization.members.length;
  const pending = toInvitationRows(organization.invitations, formatDate).filter((row) => !row.expired).length;
  // a wrong figure is worse than an error page
  if (!qrCount.success) throw new Error(qrCount.message);
  const customRoles = roles.filter((role) => !role.system).length;
  const roleLimit = entitlements.limits.customRoles;

  const usage: BillingUsage = {
    qrCodes: { used: qrCount.data, hint: "Outside the trash" },
    members: {
      used: members + pending,
      hint: pending ? `${plural(members, "member")} · ${plural(pending, "pending invitation")}` : undefined,
    },
    customRoles: { used: customRoles },
  };

  return (
    <BillingOverview
      entitlements={entitlements}
      usage={usage}
      // better-auth's hard cap sits above every plan limit, like on the roles page
      limits={{ customRoles: roleLimit === null ? MAX_CUSTOM_ROLES : Math.min(roleLimit, MAX_CUSTOM_ROLES) }}
      supportEmail={siteConfig.supportEmail}
      formatDate={formatDate}
    />
  );
}
