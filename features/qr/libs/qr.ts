"use server";

import { APIError } from "better-auth/api";

import { buildQrAnalytics } from "@/features/qr/libs/qr-analytics";
import { buildQrWhere, liveQrWhere, qrListSelect, qrTagNames, qrTopSelect, type QrStatsData } from "@/features/qr/libs/qr-query";
import { qrIdSchema, qrQuerySchema, type QrQuerySchemaType } from "@/features/qr/schemas/qr-schema";
import { countQrCodes, getQrCode as findQrCode, getQrCodes as findQrCodes } from "@/features/qr/services/qr";
import { countQrScans, getQrScans } from "@/features/qr/services/qr-scan";
import { requireOrganization } from "@/features/qr/services/require-organization";
import { cacheTags } from "@/lib/cache/cache-tags";
import { toCsv } from "@/utils/csv";
import { shortLink } from "@/utils/format";
import { apiResponse } from "@/utils/response";
import { getQrBaseUrl } from "@/utils/short-link";

// raw scans can grow large; cap the export
const MAX_SCAN_ROWS = 100_000;

const notFound = () => new APIError("NOT_FOUND", { message: "QR code not found" });

const findLiveQrCode = (organizationId: string, id: number) =>
  findQrCode({ where: { id, ...liveQrWhere(organizationId) }, include: { tags: { select: { name: true }, orderBy: { name: "asc" } } } });

export const getQrCodes = async (organizationSlug: string, query: QrQuerySchemaType) => {
  try {
    const { page, size, search, tag, status } = qrQuerySchema.parse(query);
    const { organization } = await requireOrganization(organizationSlug);
    const where = buildQrWhere(organization.id, { search, tag, status });

    const [data, count] = await Promise.all([
      findQrCodes({ where, select: qrListSelect, orderBy: { id: "desc" }, skip: (page - 1) * size, take: size }),
      countQrCodes({ where }),
    ]);

    return apiResponse.multi({ data, count });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const getQrCode = async (organizationSlug: string, id: number) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const { organization } = await requireOrganization(organizationSlug);

    const data = await findLiveQrCode(organization.id, qrId);
    if (!data) throw notFound();

    return apiResponse.single({ data, message: "GET QR code successful" });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// one code in the list shape, for pages that show a code outside the current search results
export const getQrListItem = async (organizationSlug: string, id: number) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const { organization } = await requireOrganization(organizationSlug);

    const data = await findQrCode({ where: { id: qrId, ...liveQrWhere(organization.id) }, select: qrListSelect });
    if (!data) throw notFound();

    return apiResponse.single({ data });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// just the live total, read fresh (no `use cache`) for the sidebar
export const getQrCount = async (organizationSlug: string) => {
  try {
    const { organization } = await requireOrganization(organizationSlug);
    const data = await countQrCodes({ where: liveQrWhere(organization.id) }, { cache: false });
    return apiResponse.single({ data });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const getQrStats = async (organizationSlug: string) => {
  try {
    const { organization } = await requireOrganization(organizationSlug);
    const live = liveQrWhere(organization.id);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [total, active, scans, scansToday, top] = await Promise.all([
      countQrCodes({ where: live }),
      countQrCodes({ where: { ...live, status: "ACTIVE" } }),
      // scans are trashed along with their code, so they're tagged with QR codes too
      countQrScans({ where: { qrCode: live } }, { tags: cacheTags.qrCodes }),
      countQrScans({ where: { scannedAt: { gte: startOfToday }, qrCode: live } }, { tags: cacheTags.qrCodes }),
      findQrCode({ where: { ...live, scanCount: { gt: 0 } }, orderBy: { scanCount: "desc" }, select: qrTopSelect }),
    ]);

    const data: QrStatsData = { total, active, scans, scansToday, top };
    return apiResponse.single({ data });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const getQrAnalytics = async (organizationSlug: string, id: number) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const { organization } = await requireOrganization(organizationSlug);

    const qr = await findLiveQrCode(organization.id, qrId);
    if (!qr) throw notFound();

    const analytics = await buildQrAnalytics(qr.id);

    return apiResponse.single({
      data: { qr: { id: qr.id, name: qr.name, tags: qrTagNames(qr) }, analytics },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const getTrashedQrCodes = async (organizationSlug: string) => {
  try {
    const { organization } = await requireOrganization(organizationSlug);
    const data = await findQrCodes({
      where: { organizationId: organization.id, deletedAt: { not: null } },
      select: qrListSelect,
      orderBy: { deletedAt: "desc" },
    });

    return apiResponse.multi({ data, count: data.length });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

// everything matching the list filters, ignoring pagination
export const exportQrCodes = async (organizationSlug: string, query: QrQuerySchemaType) => {
  try {
    const { search, tag, status } = qrQuerySchema.parse(query);
    const { organization } = await requireOrganization(organizationSlug);

    // a one-off download: don't keep the whole list in the cache
    const rows = await findQrCodes(
      { where: buildQrWhere(organization.id, { search, tag, status }), select: qrListSelect, orderBy: { id: "desc" } },
      { cache: false },
    );
    const baseUrl = getQrBaseUrl();

    const csv = toCsv(
      ["ID", "Name", "Short link", "Destination", "Status", "Scans", "Tags", "Created by", "Created at", "Expires at"],
      rows.map((qr) => [
        qr.id,
        qr.name,
        shortLink(baseUrl, qr.slug),
        qr.destination,
        qr.status,
        qr.scanCount,
        qrTagNames(qr).join(", "),
        qr.createdBy.name,
        qr.createdAt,
        qr.expiresAt,
      ]),
    );

    return apiResponse.single({ data: { fileName: `${organization.slug}-qr-codes.csv`, csv } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const exportQrScans = async (organizationSlug: string, id: number) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const { organization } = await requireOrganization(organizationSlug);

    const qr = await findLiveQrCode(organization.id, qrId);
    if (!qr) throw notFound();

    // newest first; a one-off download, so skip the cache
    const scans = await getQrScans(
      {
        where: { qrCodeId: qr.id },
        select: { scannedAt: true, visitorHash: true, device: true, country: true, region: true },
        orderBy: { scannedAt: "desc" },
        take: MAX_SCAN_ROWS,
      },
      { cache: false },
    );

    const csv = toCsv(
      ["Scanned at (UTC)", "Visitor", "Device", "Country", "Region"],
      // a short prefix is enough to tell visitors apart in a spreadsheet
      scans.map((scan) => [scan.scannedAt, scan.visitorHash.slice(0, 12), scan.device, scan.country, scan.region]),
    );

    return apiResponse.single({ data: { fileName: `qr-${qr.id}-scans.csv`, csv } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
