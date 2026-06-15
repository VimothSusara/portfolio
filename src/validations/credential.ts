import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (val) =>
      val === "" ||
      val.startsWith("/") ||
      z.string().url().safeParse(val).success,
    { message: "Must be a valid URL or site path" },
  );

export const credentialFormSchema = z.object({
  title: z.string().trim().min(2).max(120),
  issuer: z.string().trim().max(120).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  type: z.enum(["CERTIFICATION", "BADGE", "AWARD"]),
  credentialUrl: optionalUrl,
  iconUrl: optionalUrl,
  imageId: z.string().optional().or(z.literal("")),
  issuedAt: z.string().optional().or(z.literal("")),
  expiresAt: z.string().optional().or(z.literal("")),
  sortOrder: z.number().int().min(0).max(9999),
  featured: z.boolean(),
  published: z.boolean(),
});

export type CredentialFormValues = z.infer<typeof credentialFormSchema>;

function parseOptionalDate(value: string | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toCredentialDbValues(data: CredentialFormValues) {
  return {
    title: data.title,
    issuer: data.issuer || null,
    description: data.description || null,
    type: data.type,
    credentialUrl: data.credentialUrl || null,
    iconUrl: data.iconUrl || null,
    imageId: data.imageId || null,
    issuedAt: parseOptionalDate(data.issuedAt),
    expiresAt: parseOptionalDate(data.expiresAt),
    sortOrder: data.sortOrder,
    featured: data.featured,
    published: data.published,
  };
}
