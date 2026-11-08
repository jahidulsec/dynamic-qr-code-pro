import { getQrTags } from "@/features/qr-tags/services/qr-tag";

/** The names in `names` that are not yet tags of the organization; read fresh, for permission checks. */
export async function missingQrTagNames(organizationId: string, names: string[]) {
  if (!names.length) return [];
  const existing = await getQrTags(
    { where: { organizationId, name: { in: names } }, select: { name: true } },
    { cache: false },
  );
  const found = new Set(existing.map((tag) => tag.name));
  return names.filter((name) => !found.has(name));
}
