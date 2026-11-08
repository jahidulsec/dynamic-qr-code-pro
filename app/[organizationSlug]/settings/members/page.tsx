import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IconUserPlus } from "@tabler/icons-react";

import { Section, SectionCardHeader, SectionLabel, SectionMeta } from "@/components/shared/section/section";
import { Button } from "@/components/ui/button";
import { PAGE_TITLES } from "@/features/dashboard";
import {
  getMembership,
  InvitationTable,
  InviteMemberDialog,
  isManagerRole,
  isOwnerRole,
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
  const membership = await getMembership(organizationSlug);
  if (!membership) notFound();

  const { organization, member, session } = membership;
  const canManage = isManagerRole(member.role);
  const viewerIsOwner = isOwnerRole(member.role);

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
          {canManage && (
            <InviteMemberDialog
              organizationName={organization.name}
              viewerIsOwner={viewerIsOwner}
              trigger={<Button size="sm" />}
            >
              <IconUserPlus data-icon="inline-start" />
              Invite member
            </InviteMemberDialog>
          )}
        </SectionCardHeader>
        <MemberTable
          members={members}
          currentUserId={session.user.id}
          canManage={canManage}
          viewerIsOwner={viewerIsOwner}
          initialRole={typeof role === "string" ? role : null}
        />
      </Section>

      {(canManage || invitations.length > 0) && (
        <Section className="overflow-hidden">
          <SectionCardHeader>
            <div className="flex items-center gap-3">
              <SectionLabel>Pending invitations</SectionLabel>
              <SectionMeta>{invitations.length}</SectionMeta>
            </div>
          </SectionCardHeader>
          {invitations.length ? (
            <InvitationTable invitations={invitations} canManage={canManage} />
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
