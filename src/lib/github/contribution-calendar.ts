import { createGithubClient, getGithubUsername } from "@/lib/github/client";
import type { ContributionCalendar } from "@/lib/github/types";

type GraphQLResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar;
    };
  };
};

export async function fetchContributionCalendar(
  username = getGithubUsername(),
): Promise<ContributionCalendar> {
  const octokit = createGithubClient();

  const data = await octokit.graphql<GraphQLResponse>(
    `
      query ($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                  color
                }
              }
            }
          }
        }
      }
    `,
    { login: username },
  );

  return data.user.contributionsCollection.contributionCalendar;
}
