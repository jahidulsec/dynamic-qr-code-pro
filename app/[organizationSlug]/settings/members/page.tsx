import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconUserPlus } from "@tabler/icons-react";

import { Section, SectionCardHeader, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import { Button } from "@/components/ui/button";
import { PAGE_TITLES } from "@/features/dashboard";
import {
  getAccess,
  InvitationTable,
  InviteMemberDialog,
  MemberTable,
  toInvitationRows,
  type MemberRow,
} from "@/features/organizations/server";
import { formatDate } from "@/utils/format";

export const metadata: Metadata = {
  title: `${PAGE_TITLES.members} · ${PAGE_TITLES.settings}`,
};

export default async function MembersSettingsPage({
  params,
  searchParams,
}: PageProps<"/[organizationSlug]/settings/members">) {
  const [{ organizationSlug }, { role }] = await Promise.all([params, searchParams]);
  const access = await getAccess(organizationSlug);
  if (!access) notFound();

  const { organization, session } = access;
  const canInvite = access.can({ invitation: ["create"] });

  const members: MemberRow[] = organization.members.map((m) => ({
    id: m.id,
    userId: m.userId,
    name: m.user.name,
    email: m.user.email,
    image: m.user.image ?? null,
    role: m.role,
    joinedAt: formatDate(new Date(m.createdAt)),
  }));

  const invitations = toInvitationRows(organization.invitations, formatDate);

  return (
    <>
      <Section className="overflow-hidden">
        <SectionCardHeader>
          <div className="flex items-center gap-3">
            <SectionLabel>Members</SectionLabel>
            <SectionMeta>{members.length}</SectionMeta>
          </div>
          {canInvite && (
            <InviteMemberDialog
              organizationSlug={organization.slug}
              organizationName={organization.name}
              trigger={<Button size="sm" />}
            >
              <IconUserPlus data-icon="inline-start" />
              Invite member
            </InviteMemberDialog>
          )}
        </SectionCardHeader>
        <MemberTable
          organizationSlug={organization.slug}
          members={members}
          currentUserId={session.user.id}
          initialRole={typeof role === "string" ? role : null}
        />
      </Section>

      {(canInvite || invitations.length > 0) && (
        <Section className="overflow-hidden">
          <SectionCardHeader>
            <div className="flex items-center gap-3">
              <SectionLabel>Pending invitations</SectionLabel>
              <SectionMeta>{invitations.length}</SectionMeta>
            </div>
          </SectionCardHeader>
          {invitations.length ? (
            <InvitationTable organizationSlug={organization.slug} invitations={invitations} />
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No pending invitations. Invite a teammate to share this workspace.
            </p>
          )}
        </Section>
      )}
    </>
  );
}
