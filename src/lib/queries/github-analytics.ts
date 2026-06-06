import { prisma } from "@/lib/prisma";
import type { ContributionCalendar } from "@/lib/github/types";
import { getGithubUsername } from "@/lib/github/client";

export async function getContributionCalendarCache() {
  return prisma.githubContributionCache.findUnique({
    where: { id: "default" },
  });
}

export async function getLatestRepoSnapshots(limit = 10) {
  return prisma.githubRepository.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      snapshots: {
        orderBy: { capturedAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getOrganizationRepositories(
  username = getGithubUsername(),
  limit = 12,
) {
  return prisma.githubRepository.findMany({
    where: {
      ownerName: { not: username },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      snapshots: {
        orderBy: { capturedAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getLatestOrganizationActivity() {
  const rows = await prisma.organizationActivity.findMany({
    orderBy: [{ capturedAt: "desc" }, { organizationName: "asc" }],
  });

  const latestByOrg = new Map<string, (typeof rows)[number]>();

  for (const row of rows) {
    if (!latestByOrg.has(row.organizationName)) {
      latestByOrg.set(row.organizationName, row);
    }
  }

  return Array.from(latestByOrg.values()).sort((a, b) =>
    a.organizationName.localeCompare(b.organizationName),
  );
}

export async function getGithubRepositoryCounts(
  username = getGithubUsername(),
) {
  const [total, personal, organization] = await Promise.all([
    prisma.githubRepository.count(),
    prisma.githubRepository.count({ where: { ownerName: username } }),
    prisma.githubRepository.count({ where: { ownerName: { not: username } } }),
  ]);

  return { total, personal, organization };
}

export function parseContributionCalendar(
  cache: Awaited<ReturnType<typeof getContributionCalendarCache>>,
): ContributionCalendar | null {
  if (!cache) return null;

  return {
    totalContributions: cache.totalContributions,
    weeks: cache.weeks as ContributionCalendar["weeks"],
  };
}

export async function getLastGithubSyncJob() {
  return prisma.syncJobRun.findFirst({
    where: { type: "GITHUB_SNAPSHOTS" },
    orderBy: { startedAt: "desc" },
  });
}
