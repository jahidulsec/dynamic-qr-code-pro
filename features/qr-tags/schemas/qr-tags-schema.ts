import { z } from "zod";

// matches how the QR form stores tags (`qrFormSchema.tags`), so renamed and on-the-fly tags look alike
export const qrTagNameSchema = z
  .string()
  .trim()
  .min(1, "Enter a tag name")
  .max(32, "Tag must be at most 32 characters")
  .transform((name) => name.toUpperCase());

export const qrTagFormSchema = z.object({
  name: qrTagNameSchema,
});

export type QrTagFormInput = z.input<typeof qrTagFormSchema>;
export type QrTagFormValues = z.output<typeof qrTagFormSchema>;

export const qrTagIdSchema = z.string().trim().min(1).max(64);
