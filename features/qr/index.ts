// Public, client-safe API of the QR feature. Import from "@/features/qr" only.
// Server-only pieces (scan recording, org guards) live in "./server".

/* ------------------------------- Components ------------------------------- */
export { QrCheckWorkspace } from "./components/qr-check-workspace";
export { QrCreateButton } from "./components/qr-create-button";
export { QrFormDialog } from "./components/qr-form-dialog";
export { QrPreview } from "./components/qr-preview";
export { QrStats } from "./components/qr-stats";
export { QrTable } from "./components/qr-table";
export { QrToolbar } from "./components/qr-toolbar";
export { TrashRowActions } from "./components/trash-row-actions";

/* ------------------- Server actions & loaders ("use server") ------------------- */
export { deleteQrAction, restoreQrAction, setQrStatusAction, trashQrAction } from "./actions/manage-qr";
export { createQrAction, updateQrAction } from "./actions/save-qr";
export {
  exportQrCodes,
  exportQrScans,
  getQrAnalytics,
  getQrCode,
  getQrCodes,
  getQrCount,
  getQrListItem,
  getQrStats,
  getTrashedQrCodes,
} from "./libs/qr";

/* --------------------------- Schemas, constants, types --------------------------- */
export { QR_ACTIVITY_DAYS, QR_PAGE_SIZE, QR_QUOTA } from "./constants";
export type { QrAnalytics } from "./libs/qr-analytics";
export { toQrCheckItem, type QrCheckItem } from "./libs/qr-check";
export type { QrListItem, QrStatsData } from "./libs/qr-query";
export {
  DEFAULT_QR_STYLE,
  parseQrStyle,
  qrFormSchema,
  qrIdSchema,
  qrSearchParamsSchema,
  qrSlugSchema,
  QR_STATUS_FILTERS,
  type QrFormInput,
  type QrFormValues,
  type QrStatusFilter,
  type QrStyle,
} from "./schemas/qr-schema";
