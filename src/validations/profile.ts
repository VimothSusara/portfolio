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

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  title: z.string().trim().min(2).max(120),
  shortBio: z.string().trim().min(10).max(300),
  longBio: z.string().trim().min(20).max(10000),
  email: z.string().trim().email().max(255),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  resumeUrl: optionalUrl,
  avatarUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  twitterUrl: optionalUrl,
  websiteUrl: optionalUrl,
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const uploadUrlSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1),
  folder: z.enum(["profile", "projects", "resumes"]),
});
