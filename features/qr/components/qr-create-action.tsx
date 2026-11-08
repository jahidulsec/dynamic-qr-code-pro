import { QrCreateButton } from "@/features/qr/components/qr-create-button";
import { getQrTags } from "@/features/qr-tags";
import { getQrBaseUrl } from "@/utils/short-link";

/** Page-heading "Generate QR" button; loads the tag suggestions the dialog needs. */
export async function QrCreateAction({ organizationSlug }: { organizationSlug: string }) {
  const tags = await getQrTags(organizationSlug);

  return (
    <QrCreateButton
      organizationSlug={organizationSlug}
      baseUrl={getQrBaseUrl()}
      tags={(tags.data ?? []).map((tag) => tag.name)}
    />
  );
}
