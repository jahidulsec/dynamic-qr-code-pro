import { SectionContainer, SectionIntro } from "@/components/shared/section/section";
import { PAGE_TITLES } from "@/features/dashboard";
import { PageHeader } from "@/features/dashboard/server";
import { getOrganizationBySlug, SettingsNav } from "@/features/organizations/server";

export default async function SettingsLayout({ children, params }: LayoutProps<"/[organizationSlug]/settings">) {
  const { organizationSlug } = await params;
  // the organization layout already guards access; this reuses its cached lookup
  const organization = await getOrganizationBySlug(organizationSlug);

  return (
    <>
      <PageHeader organizationSlug={organizationSlug} title={PAGE_TITLES.settings} />
      <SectionContainer>
        <SectionIntro
          title={PAGE_TITLES.settings}
          description={`Manage ${organization?.name ?? "this organization"}, who belongs to it and what each role can do.`}
        />
        <SettingsNav organizationSlug={organizationSlug} memberCount={organization?.members.length ?? 0} />
        {children}
      </SectionContainer>
    </>
  );
}
