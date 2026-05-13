import { z } from "zod";
import { baseQuerySchema } from "./query";

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

export const qrQuerySchema = baseQuerySchema.extend({
  isTrash: z.enum(["yes", "no"]).optional(),
});

export type QrSchemaType = z.infer<typeof qrSchema>;
export type QrQuerySchemaType = z.infer<typeof qrQuerySchema>;
