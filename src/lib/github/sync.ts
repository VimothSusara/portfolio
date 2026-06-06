import { fetchContributionCalendar } from "@/lib/github/contribution-calendar";
import { getGithubUsername } from "@/lib/github/client";
import { syncOrganizationActivity } from "@/lib/github/sync-organization-activity";
import { syncGithubRepositories } from "@/lib/github/sync-repositories";
import { prisma } from "@/lib/prisma";

export async function runGithubSync() {
  const username = getGithubUsername();

  const job = await prisma.syncJobRun.create({
    data: { type: "GITHUB_SNAPSHOTS", status: "RUNNING" },
  });

  try {
    const {
      repoCount,
      personalRepoCount,
      orgRepoCount,
      organizationCount,
    } = await syncGithubRepositories();
    const calendar = await fetchContributionCalendar(username);
    const organizationActivity = await syncOrganizationActivity();

    await prisma.githubContributionCache.upsert({
      where: { id: "default" },
      update: {
        username,
        totalContributions: calendar.totalContributions,
        weeks: calendar.weeks,
      },
      create: {
        id: "default",
        username,
        totalContributions: calendar.totalContributions,
        weeks: calendar.weeks,
      },
    });

    await prisma.syncJobRun.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        metadata: {
          username,
          repoCount,
          personalRepoCount,
          orgRepoCount,
          organizationCount,
          organizationActivity,
          totalContributions: calendar.totalContributions,
        },
      },
    });

    return {
      username,
      repoCount,
      personalRepoCount,
      orgRepoCount,
      organizationCount,
      organizationActivity,
      totalContributions: calendar.totalContributions,
    };
  } catch (error) {
    await prisma.syncJobRun.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Sync failed",
      },
    });
    throw error;
  }
}
