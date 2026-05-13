import { z } from "zod";

export const tagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

export const qrSchema = z.object({
  name: z.string().min(1),
  link: z.string().url(),
  tags: z.array(tagSchema).optional(),
  adminId: z.string().optional(),
});

export type QrSchemaType = z.infer<typeof qrSchema>;
