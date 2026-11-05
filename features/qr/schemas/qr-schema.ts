import { z } from "zod";

import { QR_PAGE_SIZE } from "@/features/qr/constants";

export const QR_DOT_STYLES = ["square", "rounded", "circle", "diamond", "leaf"] as const;
export const QR_FINDER_STYLES = ["square", "rounded", "rounded-lg", "circle", "leaf"] as const;

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex colour");

export const qrStyleSchema = z.object({
  foreground: hexColor,
  background: hexColor,
  dotStyle: z.enum(QR_DOT_STYLES),
  finderStyle: z.enum(QR_FINDER_STYLES),
  // empty means no frame
  frameText: z.string().trim().max(24, "Frame text must be at most 24 characters"),
});

export type QrStyle = z.infer<typeof qrStyleSchema>;

export const DEFAULT_QR_STYLE: QrStyle = {
  foreground: "#18181b",
  background: "#ffffff",
  dotStyle: "square",
  finderStyle: "square",
  frameText: "SCAN ME",
};

// stored JSON may predate a field or be malformed; fall back field by field
export const parseQrStyle = (value: unknown): QrStyle => {
  const result = qrStyleSchema.partial().safeParse(value);
  return { ...DEFAULT_QR_STYLE, ...(result.success ? result.data : {}) };
};

export const qrSlugSchema = z
  .string()
  .trim()
  .min(3, "Alias must be at least 3 characters")
  .max(64, "Alias must be at most 64 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens");

export const qrFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(255, "Name must be at most 255 characters"),
  destination: z
    .string()
    .trim()
    .max(2048, "URL must be at most 2048 characters")
    // only web links: a javascript: or data: destination would turn the redirect into an attack vector
    .pipe(z.url({ protocol: /^https?$/, message: "Enter a full http:// or https:// URL" })),
  slug: qrSlugSchema,
  tag: z
    .string()
    .trim()
    .max(32, "Tag must be at most 32 characters")
    .transform((tag) => tag.toUpperCase()),
  // yyyy-mm-dd from a date input, empty for "never"
  expiresAt: z.union([z.literal(""), z.iso.date("Enter a valid date")]),
  style: qrStyleSchema,
});

export type QrFormInput = z.input<typeof qrFormSchema>;
export type QrFormValues = z.output<typeof qrFormSchema>;

export const QR_STATUS_FILTERS = ["all", "active", "paused"] as const;
export type QrStatusFilter = (typeof QR_STATUS_FILTERS)[number];

// list filters as they arrive from the URL; anything invalid falls back instead of failing the page
export const qrQuerySchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  size: z.coerce.number().int().positive().max(100).catch(QR_PAGE_SIZE),
  search: z.string().trim().optional().catch(undefined),
  tag: z.string().trim().optional().catch(undefined),
  status: z.enum(QR_STATUS_FILTERS).catch("all"),
});

// every field is optional: missing or invalid values fall back to the defaults above
export type QrQuerySchemaType = Partial<z.input<typeof qrQuerySchema>>;

export const qrIdSchema = z.coerce.number().int().positive();
