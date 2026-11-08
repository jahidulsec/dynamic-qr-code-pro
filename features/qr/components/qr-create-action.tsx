import { hasPermission } from "@/features/organizations/server";
import { QrCreateButton } from "@/features/qr/components/qr-create-button";
import { getQrTags } from "@/features/qr-tags";
import { getQrBaseUrl } from "@/utils/short-link";

/** Page-heading "Generate QR" button; loads the tag suggestions the dialog needs. Hidden without `qr:create`. */
export async function QrCreateAction({ organizationSlug }: { organizationSlug: string }) {
  const [canCreate, tags] = await Promise.all([hasPermission(organizationSlug, { qr: ["create"] }), getQrTags(organizationSlug)]);
  if (!canCreate) return null;

  return (
    <QrCreateButton
      organizationSlug={organizationSlug}
      baseUrl={getQrBaseUrl()}
      tags={(tags.data ?? []).map((tag) => tag.name)}
    />
  );
}
