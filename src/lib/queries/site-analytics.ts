import { subDays, startOfDay, format } from "date-fns";
import { prisma } from "@/lib/prisma";

function buildDailySeries<T>(
  rows: T[],
  days: number,
  getDate: (row: T) => Date,
) {
  const since = startOfDay(subDays(new Date(), days - 1));
  const buckets = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    buckets.set(format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd"), 0);
  }

  for (const row of rows) {
    const key = format(startOfDay(getDate(row)), "yyyy-MM-dd");
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({
    date,
    label: format(new Date(date), "MMM d"),
    count,
  }));
}

export async function getSiteAnalyticsSummary(days = 30) {
  const since = subDays(new Date(), days);

  const [
    pageViews,
    projectViews,
    resumeDownloads,
    visitors,
    topPagesRaw,
    topProjectsRaw,
    pageViewsRecent,
    visitorsRecent,
  ] = await Promise.all([
    prisma.pageView.count({ where: { viewedAt: { gte: since } } }),
    prisma.projectView.count({ where: { viewedAt: { gte: since } } }),
    prisma.resumeDownload.count({ where: { downloadedAt: { gte: since } } }),
    prisma.visitor.count({ where: { createdAt: { gte: since } } }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { viewedAt: { gte: since } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    prisma.projectView.groupBy({
      by: ["projectId"],
      where: { viewedAt: { gte: since } },
      _count: { projectId: true },
      orderBy: { _count: { projectId: "desc" } },
      take: 10,
    }),
    prisma.pageView.findMany({
      where: { viewedAt: { gte: since } },
      select: { viewedAt: true },
    }),
    prisma.visitor.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const projectIds = topProjectsRaw.map((row) => row.projectId);
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true, title: true, slug: true },
  });
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return {
    days,
    pageViews,
    projectViews,
    resumeDownloads,
    visitors,
    pageViewsDaily: buildDailySeries(
      pageViewsRecent,
      days,
      (row) => row.viewedAt,
    ),
    visitorsDaily: buildDailySeries(
      visitorsRecent,
      days,
      (row) => row.createdAt,
    ),
    topPages: topPagesRaw.map((row) => ({
      path: row.path,
      views: row._count.path,
    })),
    topProjects: topProjectsRaw.flatMap((row) => {
      const project = projectMap.get(row.projectId);
      if (!project) return [];
      return [
        {
          projectId: row.projectId,
          title: project.title,
          slug: project.slug,
          views: row._count.projectId,
        },
      ];
    }),
  };
}

export async function getSiteAnalyticsSummaryLast7Days() {
  const since = subDays(new Date(), 7);

  const [pageViews, visitors, projectViews] = await Promise.all([
    prisma.pageView.count({ where: { viewedAt: { gte: since } } }),
    prisma.visitor.count({ where: { createdAt: { gte: since } } }),
    prisma.projectView.count({ where: { viewedAt: { gte: since } } }),
  ]);

  return { pageViews, visitors, projectViews };
}
