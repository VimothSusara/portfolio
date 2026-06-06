import type { Octokit } from "octokit";
import { createGithubClient, getGithubUsername } from "@/lib/github/client";
import {
  discoverGithubOrganizations,
  type GithubOrganization,
} from "@/lib/github/organizations";
import { prisma } from "@/lib/prisma";

export type OrganizationActivitySnapshot = {
  organizationName: string;
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
  totalContributions: number;
};

type OrganizationContributionsResponse = {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      totalIssueContributions: number;
      contributionCalendar: {
        totalContributions: number;
      };
    };
  };
};

function getContributionWindow() {
  const to = new Date();
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  return { from: from.toISOString(), to: to.toISOString() };
}

async function fetchOrganizationContributions(
  octokit: Octokit,
  username: string,
  organization: GithubOrganization,
) {
  const { from, to } = getContributionWindow();

  const data = await octokit.graphql<OrganizationContributionsResponse>(
    `
      query ($login: String!, $organizationID: ID!, $from: DateTime!, $to: DateTime!) {
        user(login: $login) {
          contributionsCollection(
            from: $from
            to: $to
            organizationID: $organizationID
          ) {
            totalCommitContributions
            totalPullRequestContributions
            totalPullRequestReviewContributions
            totalIssueContributions
            contributionCalendar {
              totalContributions
            }
          }
        }
      }
    `,
    {
      login: username,
      organizationID: organization.id,
      from,
      to,
    },
  );

  const collection = data.user.contributionsCollection;

  return {
    organizationName: organization.login,
    commits: collection.totalCommitContributions,
    pullRequests: collection.totalPullRequestContributions,
    reviews: collection.totalPullRequestReviewContributions,
    issues: collection.totalIssueContributions,
    totalContributions: collection.contributionCalendar.totalContributions,
  };
}

export async function syncOrganizationActivity() {
  const octokit = createGithubClient();
  const username = getGithubUsername();
  const organizations = await discoverGithubOrganizations(octokit);
  const snapshots: OrganizationActivitySnapshot[] = [];

  for (const organization of organizations) {
    const snapshot = await fetchOrganizationContributions(
      octokit,
      username,
      organization,
    );

    await prisma.organizationActivity.create({
      data: {
        organizationName: snapshot.organizationName,
        commits: snapshot.commits,
        pullRequests: snapshot.pullRequests,
        reviews: snapshot.reviews,
        issues: snapshot.issues,
      },
    });

    snapshots.push(snapshot);
  }

  return snapshots;
}
