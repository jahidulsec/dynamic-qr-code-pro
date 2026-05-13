import { z } from "zod";

export const baseQuerySchema = z.object({
  page: z.number().default(1),
  size: z.number().default(20),
  search: z.string().trim().optional(),
});

export type BaseQuerySchemaType = z.infer<typeof baseQuerySchema>;
