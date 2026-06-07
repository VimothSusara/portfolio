import { prisma } from "@/lib/prisma";
import { getSiteAnalyticsSummaryLast7Days } from "@/lib/queries/site-analytics";

export async function getAdminDashboardStats() {
  const [
    totalProjects,
    publishedProjects,
    pendingMessages,
    resumeDownloads,
    technologies,
    trafficLast7Days,
  ] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { status: "PUBLISHED" } }),
    prisma.contactMessage.count({ where: { status: "PENDING" } }),
    prisma.resumeDownload.count(),
    prisma.technology.count(),
    getSiteAnalyticsSummaryLast7Days(),
  ]);

  return {
    totalProjects,
    publishedProjects,
    pendingMessages,
    resumeDownloads,
    technologies,
    ...trafficLast7Days,
  };
}
