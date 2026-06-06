import type { Octokit } from "octokit";
import { createGithubClient, getGithubUsername } from "@/lib/github/client";
import { discoverGithubOrganizations } from "@/lib/github/organizations";
import { prisma } from "@/lib/prisma";

type RepoPayload = {
  fork?: boolean;
  private?: boolean;
  owner: { login: string };
  name: string;
  stargazers_count?: number | null;
  forks_count?: number | null;
  watchers_count?: number | null;
  open_issues_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

async function upsertRepository(repo: RepoPayload) {
  if (repo.fork || repo.private) return false;

  const ownerName = repo.owner.login;
  const repoName = repo.name;

  const record = await prisma.githubRepository.upsert({
    where: {
      ownerName_repoName: { ownerName, repoName },
    },
    update: {
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      watchers: repo.watchers_count ?? 0,
      openIssues: repo.open_issues_count ?? 0,
      updatedAt: new Date(repo.updated_at ?? new Date().toISOString()),
    },
    create: {
      ownerName,
      repoName,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      watchers: repo.watchers_count ?? 0,
      openIssues: repo.open_issues_count ?? 0,
      createdAt: new Date(repo.created_at ?? new Date().toISOString()),
      updatedAt: new Date(repo.updated_at ?? new Date().toISOString()),
    },
  });

  const linkedProject = await prisma.project.findFirst({
    where: { githubRepositoryId: record.id },
    select: { id: true },
  });

  await prisma.githubSnapshot.create({
    data: {
      repositoryId: record.id,
      stars: record.stars,
      forks: record.forks,
      openIssues: record.openIssues,
      commits: 0,
      projectId: linkedProject?.id ?? null,
    },
  });

  return true;
}

async function syncPersonalRepositories(
  octokit: Octokit,
  username: string,
) {
  const repos = await octokit.paginate(octokit.rest.repos.listForUser, {
    username,
    sort: "updated",
    per_page: 100,
  });

  let count = 0;
  for (const repo of repos) {
    if (await upsertRepository(repo)) count++;
  }

  return count;
}

async function syncOrganizationRepositories(octokit: Octokit) {
  const organizations = await discoverGithubOrganizations(octokit);
  const syncedRepoKeys = new Set<string>();
  let count = 0;

  for (const org of organizations) {
    const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
      org: org.login,
      type: "public",
      sort: "updated",
      per_page: 100,
    });

    for (const repo of repos) {
      if (await upsertRepository(repo)) {
        count++;
        syncedRepoKeys.add(`${repo.owner.login}/${repo.name}`);
      }
    }
  }

  const orgLogins = organizations.map((org) => org.login);
  if (orgLogins.length > 0) {
    const storedOrgRepos = await prisma.githubRepository.findMany({
      where: { ownerName: { in: orgLogins } },
      select: { id: true, ownerName: true, repoName: true },
    });

    const staleRepoIds = storedOrgRepos
      .filter(
        (repo) => !syncedRepoKeys.has(`${repo.ownerName}/${repo.repoName}`),
      )
      .map((repo) => repo.id);

    if (staleRepoIds.length > 0) {
      await prisma.githubRepository.deleteMany({
        where: { id: { in: staleRepoIds } },
      });
    }
  }

  return { count, organizationCount: organizations.length };
}

export async function syncGithubRepositories() {
  const octokit = createGithubClient();
  const username = getGithubUsername();

  const personalRepoCount = await syncPersonalRepositories(octokit, username);
  const { count: orgRepoCount, organizationCount } =
    await syncOrganizationRepositories(octokit);

  return {
    repoCount: personalRepoCount + orgRepoCount,
    personalRepoCount,
    orgRepoCount,
    organizationCount,
  };
}
