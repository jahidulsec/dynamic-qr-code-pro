import { z } from "zod";

export const sendEmailSchema = z
  .object({
    to: z.union([z.email(), z.array(z.email()).min(1)]),
    subject: z.string().trim().min(1, "Subject is required"),
    text: z.string().optional(),
    html: z.string().optional(),
    replyTo: z.email().optional(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .refine((value) => value.text || value.html, {
    message: "Provide a text or html body",
    path: ["text"],
  });

export type SendEmailValues = z.infer<typeof sendEmailSchema>;
