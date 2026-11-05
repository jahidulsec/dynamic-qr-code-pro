import { cache } from "react";

import prisma from "@/config/db";
import type { Prisma } from "@/generated/prisma/client";
import type { QrStatusFilter } from "@/features/qr/schemas/qr-schema";

export type QrListFilters = {
  search?: string;
  tag?: string;
  status?: QrStatusFilter;
};

const qrListSelect = {
  id: true,
  name: true,
  slug: true,
  destination: true,
  status: true,
  scanCount: true,
  expiresAt: true,
  createdAt: true,
  deletedAt: true,
  tag: { select: { name: true } },
  createdBy: { select: { name: true } },
} satisfies Prisma.QrCodeSelect;

export type QrListItem = Prisma.QrCodeGetPayload<{ select: typeof qrListSelect }>;

export function buildQrWhere(organizationId: string, { search, tag, status }: QrListFilters): Prisma.QrCodeWhereInput {
  const term = search?.trim();
  const id = term ? Number(term.replace(/^#\s*/, "")) : NaN;

  return {
    organizationId,
    deletedAt: null,
    ...(tag ? { tag: { name: tag } } : {}),
    ...(status === "active" ? { status: "ACTIVE" } : status === "paused" ? { status: "PAUSED" } : {}),
    ...(term
      ? {
          OR: [
            ...(Number.isInteger(id) && id > 0 ? [{ id }] : []),
            { name: { contains: term } },
            { slug: { contains: term } },
            { destination: { contains: term } },
            { createdBy: { name: { contains: term } } },
          ],
        }
      : {}),
  };
}

export async function listQrCodes(
  organizationId: string,
  filters: QrListFilters,
  { take, skip }: { take: number; skip: number },
) {
  const where = buildQrWhere(organizationId, filters);

  const [items, count] = await prisma.$transaction([
    prisma.qrCode.findMany({ where, select: qrListSelect, orderBy: { id: "desc" }, skip, take }),
    prisma.qrCode.count({ where }),
  ]);

  return { items, count };
}

// everything matching the filters, for CSV export
export const listAllQrCodes = (organizationId: string, filters: QrListFilters) =>
  prisma.qrCode.findMany({ where: buildQrWhere(organizationId, filters), select: qrListSelect, orderBy: { id: "desc" } });

export const listTrashedQrCodes = (organizationId: string) =>
  prisma.qrCode.findMany({
    where: { organizationId, deletedAt: { not: null } },
    select: qrListSelect,
    orderBy: { deletedAt: "desc" },
  });

export const getQrCode = (organizationId: string, id: number) =>
  prisma.qrCode.findFirst({
    where: { id, organizationId, deletedAt: null },
    include: { tag: { select: { name: true } } },
  });

export type QrDetail = NonNullable<Awaited<ReturnType<typeof getQrCode>>>;

// counts codes that use up quota: everything not in the trash
export const countQrCodes = (organizationId: string) => prisma.qrCode.count({ where: { organizationId, deletedAt: null } });

// cached per request: the sidebar (layout) and the dashboard (page) both need these
export const getTagCounts = cache(async (organizationId: string) => {
  const tags = await prisma.qrTag.findMany({
    where: { organizationId },
    select: { name: true, _count: { select: { qrCodes: { where: { deletedAt: null } } } } },
    orderBy: { name: "asc" },
  });
  return tags.map((tag) => ({ name: tag.name, count: tag._count.qrCodes }));
});

export const getQrStats = cache(async (organizationId: string) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [total, active, scans, scansToday, top] = await prisma.$transaction([
    prisma.qrCode.count({ where: { organizationId, deletedAt: null } }),
    prisma.qrCode.count({ where: { organizationId, deletedAt: null, status: "ACTIVE" } }),
    prisma.qrCode.aggregate({ where: { organizationId, deletedAt: null }, _sum: { scanCount: true } }),
    prisma.qrScan.count({ where: { scannedAt: { gte: startOfToday }, qrCode: { organizationId, deletedAt: null } } }),
    prisma.qrCode.findFirst({
      where: { organizationId, deletedAt: null, scanCount: { gt: 0 } },
      orderBy: { scanCount: "desc" },
      select: { id: true, name: true, scanCount: true, tag: { select: { name: true } } },
    }),
  ]);

  return { total, active, scans: scans._sum.scanCount ?? 0, scansToday, top };
});

export type QrStatsData = Awaited<ReturnType<typeof getQrStats>>;
export type QrTagCount = Awaited<ReturnType<typeof getTagCounts>>[number];
