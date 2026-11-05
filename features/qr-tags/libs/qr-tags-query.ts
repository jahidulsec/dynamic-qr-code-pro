import type { Prisma } from "@/generated/prisma/client";

export const qrTagListSelect = {
  id: true,
  name: true,
  createdAt: true,
  // only codes outside the trash: the ones shown on the dashboard
  _count: { select: { qrCodes: { where: { deletedAt: null } } } },
} satisfies Prisma.QrTagSelect;

type QrTagListRow = Prisma.QrTagGetPayload<{ select: typeof qrTagListSelect }>;

export type QrTagListItem = Omit<QrTagListRow, "_count"> & { count: number };

export const toQrTagListItem = ({ _count, ...tag }: QrTagListRow): QrTagListItem => ({ ...tag, count: _count.qrCodes });
