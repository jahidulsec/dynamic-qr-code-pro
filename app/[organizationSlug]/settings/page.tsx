import { redirect } from "next/navigation";

export default async function SettingsPage({ params }: PageProps<"/[organizationSlug]/settings">) {
  const { organizationSlug } = await params;
  redirect(`/${organizationSlug}/settings/general`);
}
