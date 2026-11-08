import type { Prisma } from "@/generated/prisma/client";
import type { QrStatusFilter } from "@/features/qr/schemas/qr-schema";

export type QrListFilters = {
  search?: string;
  tag?: string;
  status?: QrStatusFilter;
};

const qrTagsSelect = { select: { name: true }, orderBy: { name: "asc" } } satisfies Prisma.QrCode$tagsArgs;

/** a code's tag names, for display and the edit form */
export const qrTagNames = (qr: { tags: { name: string }[] }) => qr.tags.map((tag) => tag.name);

export const qrListSelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
  destination: true,
  status: true,
  style: true,
  scanCount: true,
  expiresAt: true,
  createdAt: true,
  deletedAt: true,
  tags: qrTagsSelect,
  createdBy: { select: { name: true } },
} satisfies Prisma.QrCodeSelect;

export type QrListItem = Prisma.QrCodeGetPayload<{ select: typeof qrListSelect }>;

export const qrTopSelect = {
  id: true,
  name: true,
  scanCount: true,
  tags: qrTagsSelect,
} satisfies Prisma.QrCodeSelect;

export type QrStatsData = {
  total: number;
  active: number;
  scans: number;
  scansToday: number;
  top: Prisma.QrCodeGetPayload<{ select: typeof qrTopSelect }> | null;
};

// codes outside the trash: the ones that count toward quota and show on the dashboard
export const liveQrWhere = (organizationId: string) => ({ organizationId, deletedAt: null }) satisfies Prisma.QrCodeWhereInput;

export function buildQrWhere(organizationId: string, { search, tag, status }: QrListFilters): Prisma.QrCodeWhereInput {
  const term = search?.trim();
  const id = term ? Number(term.replace(/^#\s*/, "")) : NaN;

  return {
    ...liveQrWhere(organizationId),
    ...(tag ? { tags: { some: { name: tag } } } : {}),
    ...(status === "active" ? { status: "ACTIVE" } : status === "paused" ? { status: "PAUSED" } : {}),
    ...(term
      ? {
          OR: [
            ...(Number.isInteger(id) && id > 0 ? [{ id }] : []),
            { name: { contains: term } },
            { slug: { contains: term } },
            { destination: { contains: term } },
            { tags: { some: { name: { contains: term } } } },
            { createdBy: { name: { contains: term } } },
          ],
        }
      : {}),
  };
}
