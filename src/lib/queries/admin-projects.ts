import { prisma } from "@/lib/prisma";

export async function getAdminProjects() {
  return prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: {
      technologies: {
        include: { technology: true },
      },
    },
  });
}

export async function getAdminProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      technologies: {
        include: { technology: true },
      },
    },
  });
}

export async function getAdminTechnologies() {
  return prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
}