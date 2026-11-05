"use server";

import { APIError } from "better-auth/api";

import { qrIdSchema, qrQuerySchema, type QrQuerySchemaType } from "@/features/qr/schemas/qr-schema";
import { getQrAnalytics as buildQrAnalytics, listQrScans } from "@/features/qr/services/get-qr-analytics";
import {
  getQrCode as findQrCode,
  getQrStats as findQrStats,
  getTagCounts,
  listAllQrCodes,
  listQrCodes,
  listTrashedQrCodes,
} from "@/features/qr/services/get-qrs";
import { requireOrganization } from "@/features/qr/services/require-organization";
import { toCsv } from "@/utils/csv";
import { shortLink } from "@/utils/format";
import { apiResponse } from "@/utils/response";
import { getQrBaseUrl } from "@/utils/short-link";

// raw scans can grow large; cap the export
const MAX_SCAN_ROWS = 100_000;

const notFound = () => new APIError("NOT_FOUND", { message: "QR code not found" });

export const getQrCodes = async (organizationSlug: string, query: QrQuerySchemaType) => {
  try {
    const { page, size, search, tag, status } = qrQuerySchema.parse(query);
    const { organization } = await requireOrganization(organizationSlug);

    const { items: data, count } = await listQrCodes(
      organization.id,
      { search, tag, status },
      { take: size, skip: (page - 1) * size },
    );

    return apiResponse.multi({ data, count });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const getQrCode = async (organizationSlug: string, id: number) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const { organization } = await requireOrganization(organizationSlug);

    const data = await findQrCode(organization.id, qrId);
    if (!data) throw notFound();

    return apiResponse.single({ data, message: "GET QR code successful" });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const getQrStats = async (organizationSlug: string) => {
  try {
    const { organization } = await requireOrganization(organizationSlug);
    const data = await findQrStats(organization.id);

    return apiResponse.single({ data });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const getQrTags = async (organizationSlug: string) => {
  try {
    const { organization } = await requireOrganization(organizationSlug);
    const data = await getTagCounts(organization.id);

    return apiResponse.multi({ data, count: data.length });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const getQrAnalytics = async (organizationSlug: string, id: number) => {
  try {
    const qrId = qrIdSchema.parse(id);
    const { organization } = await requireOrganization(organizationSlug);

    const qr = await findQrCode(organization.id, qrId);
    if (!qr) throw notFound();

    const analytics = await buildQrAnalytics(qr.id);

    return apiResponse.single({
      data: { qr: { id: qr.id, name: qr.name, tag: qr.tag?.name ?? null }, analytics },
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const getTrashedQrCodes = async (organizationSlug: string) => {
  try {
    const { organization } = await requireOrganization(organizationSlug);
    const data = await listTrashedQrCodes(organization.id);

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

    const rows = await listAllQrCodes(organization.id, { search, tag, status });
    const baseUrl = getQrBaseUrl();

    const csv = toCsv(
      ["ID", "Name", "Short link", "Destination", "Status", "Scans", "Tag", "Created by", "Created at", "Expires at"],
      rows.map((qr) => [
        qr.id,
        qr.name,
        shortLink(baseUrl, qr.slug),
        qr.destination,
        qr.status,
        qr.scanCount,
        qr.tag?.name,
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

    const qr = await findQrCode(organization.id, qrId);
    if (!qr) throw notFound();

    const scans = await listQrScans(qr.id, MAX_SCAN_ROWS);

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
