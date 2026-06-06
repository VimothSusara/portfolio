import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10).max(5000),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const contactApiSchema = contactFormSchema.extend({
  website: z.string().max(0).optional().or(z.literal("")),
});

export const messageStatusSchema = z.object({
  status: z.enum(["PENDING", "READ", "ARCHIVED", "SPAM"]),
});