import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((val) => val === "" || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL",
  });

export const projectFormSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  shortDescription: z.string().trim().min(10).max(300),
  description: z.string().trim().min(20),
  githubUrl: optionalUrl,
  liveUrl: optionalUrl,
  featured: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  lifecycle: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED"]),
  type: z.enum(["WEBSITE", "APPLICATION", "GAME", "OTHER"]),
  sortOrder: z.number().int().min(0),
  technologyIds: z.array(z.string()),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;