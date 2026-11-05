import prisma from "@/config/db";
import { Prisma } from "@/generated/prisma/client";
import { QR_ACTIVITY_DAYS } from "@/features/qr/constants";

// grouped and raw queries aren't supported by the cached service layer, so these read Prisma directly

export type Share = { label: string; count: number; percent: number };

const DEVICE_LABELS: Record<string, string> = {
  android: "Android",
  ios: "iPhone & iPad",
  desktop: "Desktop",
  other: "Other",
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const toShares = (rows: { label: string; count: number }[], total: number, limit: number): Share[] => {
  const sorted = [...rows].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, limit);
  const rest = sorted.slice(limit).reduce((sum, row) => sum + row.count, 0);
  if (rest > 0) top.push({ label: "Other", count: rest });
  return top.map((row) => ({ ...row, percent: total ? Math.round((row.count / total) * 100) : 0 }));
};

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export async function buildQrAnalytics(qrCodeId: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (QR_ACTIVITY_DAYS - 1));

  // scans are stored in UTC; shift them into the server's time zone before grouping by day
  const offsetMinutes = -start.getTimezoneOffset();

  const [uniqueRows, dailyRows, deviceRows, regionRows] = await Promise.all([
    prisma.$queryRaw<{ visitors: bigint | number }[]>(
      Prisma.sql`SELECT COUNT(DISTINCT visitorHash) AS visitors FROM qr_scan WHERE qrCodeId = ${qrCodeId}`,
    ),
    prisma.$queryRaw<{ day: string; scans: bigint | number }[]>(
      Prisma.sql`SELECT DATE_FORMAT(DATE_ADD(scannedAt, INTERVAL ${offsetMinutes} MINUTE), '%Y-%m-%d') AS day, COUNT(*) AS scans
        FROM qr_scan WHERE qrCodeId = ${qrCodeId} AND scannedAt >= ${start}
        GROUP BY day`,
    ),
    prisma.qrScan.groupBy({ by: ["device"], where: { qrCodeId }, _count: { _all: true } }),
    prisma.qrScan.groupBy({ by: ["country", "region"], where: { qrCodeId }, _count: { _all: true } }),
  ]);

  const total = deviceRows.reduce((sum, row) => sum + row._count._all, 0);

  const scansByDay = new Map(dailyRows.map((row) => [row.day, Number(row.scans)]));
  const daily = Array.from({ length: QR_ACTIVITY_DAYS }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      date: dayKey(date),
      scans: scansByDay.get(dayKey(date)) ?? 0,
    };
  });

  const devices = toShares(
    deviceRows.map((row) => ({ label: DEVICE_LABELS[row.device] ?? row.device, count: row._count._all })),
    total,
    4,
  );

  const located = regionRows.filter((row) => row.country);
  const regions = toShares(
    located.map((row) => {
      const country = regionNames.of(row.country!) ?? row.country!;
      return { label: row.region ? `${row.region}, ${country}` : country, count: row._count._all };
    }),
    total,
    4,
  );
  const unknownLocation = total - located.reduce((sum, row) => sum + row._count._all, 0);

  return {
    total,
    uniqueVisitors: Number(uniqueRows[0]?.visitors ?? 0),
    daily,
    devices,
    regions,
    unknownLocation,
  };
}

export type QrAnalytics = Awaited<ReturnType<typeof buildQrAnalytics>>;
