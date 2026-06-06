import { prisma } from "@/lib/prisma";

export async function getAdminDashboardStats() {
  const [
    totalProjects,
    publishedProjects,
    pendingMessages,
    resumeDownloads,
    technologies,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "PUBLISHED" } }),
    prisma.contactMessage.count({ where: { status: "PENDING" } }),
    prisma.resumeDownload.count(),
    prisma.technology.count(),
  ]);

  return {
    totalProjects,
    publishedProjects,
    pendingMessages,
    resumeDownloads,
    technologies,
  };
}