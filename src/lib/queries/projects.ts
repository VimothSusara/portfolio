import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const publishedProjectInclude = {
  technologies: {
    include: {
      technology: true,
    },
    orderBy: {
      technology: {
        name: "asc" as const,
      },
    },
  },
  images: {
    orderBy: {
      sortOrder: "asc" as const,
    },
    include: {
      media: true,
    },
  },
  thumbnailImage: true,
  githubRepository: {
    select: {
      id: true,
      ownerName: true,
      repoName: true,
      stars: true,
      forks: true,
      openIssues: true,
    },
  },
} satisfies Prisma.ProjectInclude;

export async function getPublishedProjects() {
  return prisma.project.findMany({
    where: {
      status: "PUBLISHED",
    },
    orderBy: [
      { featured: "desc" as const },
      { sortOrder: "asc" as const },
      { publishedAt: "desc" as const },
    ],
    include: publishedProjectInclude,
  });
}

export async function getFeaturedProjects(limit = 3) {
  return prisma.project.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    take: limit,
    include: publishedProjectInclude,
  });
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: publishedProjectInclude,
  });
}

export async function getAllPublishedProjectSlugs() {
  return prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
}
