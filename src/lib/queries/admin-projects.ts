import { prisma } from "@/lib/prisma";

const projectInclude = {
  technologies: {
    include: { technology: true },
  },
  thumbnailImage: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    include: { media: true },
  },
};

export async function getAdminProjects() {
  return prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: projectInclude,
  });
}

export async function getAdminProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });
}

export async function getAdminTechnologies() {
  return prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}
