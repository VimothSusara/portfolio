import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine((val) => val === "" || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL",
  });

export const projectMediaInputSchema = z.object({
  publicUrl: z.string().url(),
  storagePath: z.string().min(1).optional(),
  filename: z.string().min(1).optional(),
  mimeType: z.string().min(1).optional(),
  fileSize: z.number().int().min(1).optional(),
  altText: z.string().max(200).optional(),
});

export type ProjectMediaInput = z.infer<typeof projectMediaInputSchema>;

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
  githubRepositoryId: z
    .union([z.string().cuid(), z.literal("")])
    .optional()
    .transform((value) => value || null),
  featured: z.boolean(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  lifecycle: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED"]),
  type: z.enum(["WEBSITE", "APPLICATION", "GAME", "OTHER"]),
  sortOrder: z.number().int().min(0),
  technologyIds: z.array(z.string()),
  thumbnail: projectMediaInputSchema.nullable().optional(),
  gallery: z.array(projectMediaInputSchema),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
