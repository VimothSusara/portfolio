import { prisma } from "@/lib/prisma";
import type { UploadFolder } from "@/lib/supabase/storage";

const PROFILE_ID = "default";

export type MediaUsageSnapshot = {
  usedMediaIds: Set<string>;
  usedPublicUrls: Set<string>;
};

export function getMediaFolder(storagePath: string): UploadFolder | "other" {
  const folder = storagePath.split("/")[0];
  if (folder === "profile" || folder === "projects" || folder === "resumes" || folder === "credentials") {
    return folder;
  }
  return "other";
}

export async function getMediaUsageSnapshot(): Promise<MediaUsageSnapshot> {
  const [profile, thumbnailProjects, projectImages, blogCovers, technologyIcons, credentialImages, credentialIcons] =
    await Promise.all([
      prisma.profile.findUnique({
        where: { id: PROFILE_ID },
        select: { avatarUrl: true, heroImageUrl: true, resumeUrl: true },
      }),
      prisma.project.findMany({
        where: { thumbnailImageId: { not: null } },
        select: { thumbnailImageId: true },
      }),
      prisma.projectImage.findMany({ select: { mediaId: true } }),
      prisma.blogPost.findMany({
        where: { coverImageId: { not: null } },
        select: { coverImageId: true },
      }),
      prisma.technology.findMany({
        where: { iconUrl: { not: null } },
        select: { iconUrl: true },
      }),
      prisma.credential.findMany({
        where: { imageId: { not: null } },
        select: { imageId: true },
      }),
      prisma.credential.findMany({
        where: { iconUrl: { not: null } },
        select: { iconUrl: true },
      }),
    ]);

  const usedMediaIds = new Set<string>();
  const usedPublicUrls = new Set<string>();

  for (const url of [
    profile?.avatarUrl,
    profile?.heroImageUrl,
    profile?.resumeUrl,
  ]) {
    if (url) usedPublicUrls.add(url);
  }

  for (const project of thumbnailProjects) {
    if (project.thumbnailImageId) usedMediaIds.add(project.thumbnailImageId);
  }

  for (const image of projectImages) {
    usedMediaIds.add(image.mediaId);
  }

  for (const post of blogCovers) {
    if (post.coverImageId) usedMediaIds.add(post.coverImageId);
  }

  for (const technology of technologyIcons) {
    if (technology.iconUrl) usedPublicUrls.add(technology.iconUrl);
  }

  for (const credential of credentialImages) {
    if (credential.imageId) usedMediaIds.add(credential.imageId);
  }

  for (const credential of credentialIcons) {
    if (credential.iconUrl) usedPublicUrls.add(credential.iconUrl);
  }

  return { usedMediaIds, usedPublicUrls };
}

export function isMediaInUse(
  media: { id: string; publicUrl: string },
  usage: MediaUsageSnapshot,
) {
  return usage.usedMediaIds.has(media.id) || usage.usedPublicUrls.has(media.publicUrl);
}
