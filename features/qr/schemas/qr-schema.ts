import { z } from "zod";

import { QR_ID_LENGTH, QR_MAX_TAGS, QR_PAGE_SIZE } from "@/features/qr/constants";

export const QR_DOT_STYLES = ["square", "rounded", "circle", "diamond", "leaf"] as const;
export const QR_FINDER_STYLES = ["square", "rounded", "rounded-lg", "circle", "leaf"] as const;

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour");

export const qrStyleSchema = z.object({
  foreground: hexColor,
  background: hexColor,
  dotStyle: z.enum(QR_DOT_STYLES),
  finderStyle: z.enum(QR_FINDER_STYLES),
});

export type QrStyle = z.infer<typeof qrStyleSchema>;

export const DEFAULT_QR_STYLE: QrStyle = {
  foreground: "#18181b",
  background: "#ffffff",
  dotStyle: "square",
  finderStyle: "square",
};

// stored JSON may predate a field or be malformed; fall back field by field.
// unknown keys (e.g. a legacy frameText) are stripped, since frames are never stored
export const parseQrStyle = (value: unknown): QrStyle => {
  const result = qrStyleSchema.partial().safeParse(value);
  return { ...DEFAULT_QR_STYLE, ...(result.success ? result.data : {}) };
};

// the code's id is its short link (<base>/q/<id>): nanoid(10) for new codes, a numeric string for
// codes from before the string-id change
export const qrIdSchema = z.string().trim().regex(/^[A-Za-z0-9_-]{1,64}$/, "Invalid QR code id");

// an id the create dialog generated up front, so the preview can encode the final link
export const qrNewIdSchema = z.string().regex(new RegExp(`^[A-Za-z0-9_-]{${QR_ID_LENGTH}}$`), "Invalid QR code id");

export const qrFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255, "Name must be at most 255 characters"),
  destination: z
    .string()
    .trim()
    .max(2048, "URL must be at most 2048 characters")
    // only web links: a javascript: or data: destination would turn the redirect into an attack vector
    .pipe(z.url({ protocol: /^https?$/, message: "Enter a full http:// or https:// URL" })),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(32, "Tag must be at most 32 characters")
        .transform((tag) => tag.toUpperCase()),
    )
    .max(QR_MAX_TAGS, `Use at most ${QR_MAX_TAGS} tags`)
    // "rpl" and "RPL" are the same tag once uppercased
    .transform((tags) => [...new Set(tags)]),
  // yyyy-mm-dd from a date input, empty for "never"
  expiresAt: z.union([z.literal(""), z.iso.date("Enter a valid date")]),
  style: qrStyleSchema,
});

export type QrFormInput = z.input<typeof qrFormSchema>;
export type QrFormValues = z.output<typeof qrFormSchema>;

export const QR_STATUS_FILTERS = ["all", "active", "paused"] as const;
export type QrStatusFilter = (typeof QR_STATUS_FILTERS)[number];

// columns the dashboard table can sort by; "created" (newest first) is the default
export const QR_SORT_FIELDS = ["id", "name", "destination", "scans", "createdBy", "created"] as const;
export type QrSortField = (typeof QR_SORT_FIELDS)[number];
export const QR_SORT_ORDERS = ["asc", "desc"] as const;
export type QrSortOrder = (typeof QR_SORT_ORDERS)[number];
export const QR_DEFAULT_SORT = { sort: "created", order: "desc" } as const satisfies { sort: QrSortField; order: QrSortOrder };

// list filters as they arrive from the URL; anything invalid falls back instead of failing the page
export const qrQuerySchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  size: z.coerce.number().int().positive().max(100).catch(QR_PAGE_SIZE),
  search: z.string().trim().optional().catch(undefined),
  tag: z.string().trim().optional().catch(undefined),
  status: z.enum(QR_STATUS_FILTERS).catch("all"),
  sort: z.enum(QR_SORT_FIELDS).catch(QR_DEFAULT_SORT.sort),
  order: z.enum(QR_SORT_ORDERS).catch(QR_DEFAULT_SORT.order),
});

// every field is optional: missing or invalid values fall back to the defaults above
export type QrQuerySchemaType = Partial<z.input<typeof qrQuerySchema>>;

// a single-valued URL param; repeated (array) or missing values become undefined
const urlParam = z.string().optional().catch(undefined);

// the dashboard URL (?q=&department=&status=&sort=&order=&page=&size=) mapped onto the list filters
export const qrSearchParamsSchema = z
  .object({ page: urlParam, size: urlParam, q: urlParam, department: urlParam, status: urlParam, sort: urlParam, order: urlParam })
  .transform(({ q, department, ...rest }) => qrQuerySchema.parse({ ...rest, search: q, tag: department }));
