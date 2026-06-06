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

export const technologyFormSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  iconName: z.string().trim().max(80).optional().or(z.literal("")),
  iconUrl: optionalUrl,
  websiteUrl: optionalUrl,
});

export type TechnologyFormValues = z.infer<typeof technologyFormSchema>;
