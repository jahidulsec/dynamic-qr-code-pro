import type { QrCheckState } from "@/features/qr/components/qr-test-scan-button";
import { qrTagNames, type QrListItem } from "@/features/qr/libs/qr-query";
import { parseQrStyle, type QrFormInput, type QrStyle } from "@/features/qr/schemas/qr-schema";
import { shortLink, shortLinkLabel, toDateInput } from "@/utils/format";

// everything the Click to Check page needs for one code, already serialized for the client
export type QrCheckItem = {
  id: number;
  name: string;
  destination: string;
  tags: string[];
  scanCount: number;
  state: QrCheckState;
  /** the encoded short link and its printed label */
  qrValue: string;
  qrLabel: string;
  qrStyle: QrStyle;
  editValues: QrFormInput;
};

// call on the server: dates are read in its time zone, like the dashboard table
export function toQrCheckItem(qr: QrListItem, baseUrl: string, now = new Date()): QrCheckItem {
  const expired = !!qr.expiresAt && qr.expiresAt <= now;
  const style = parseQrStyle(qr.style);

  return {
    id: qr.id,
    name: qr.name,
    destination: qr.destination,
    tags: qrTagNames(qr),
    scanCount: qr.scanCount,
    state: expired ? "expired" : qr.status === "PAUSED" ? "paused" : "ready",
    qrValue: shortLink(baseUrl, qr.slug),
    qrLabel: shortLinkLabel(baseUrl, qr.slug),
    qrStyle: style,
    editValues: {
      name: qr.name,
      destination: qr.destination,
      slug: qr.slug,
      tags: qrTagNames(qr),
      expiresAt: qr.expiresAt ? toDateInput(qr.expiresAt) : "",
      style,
    },
  };
}
