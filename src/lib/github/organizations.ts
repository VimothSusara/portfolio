import type { Octokit } from "octokit";
import { createGithubClient } from "@/lib/github/client";

export type GithubOrganization = {
  login: string;
  id: string;
};

type ViewerOrganizationsResponse = {
  viewer: {
    organizations: {
      nodes: Array<GithubOrganization | null>;
    };
  };
};

type OrganizationLookupResponse = {
  organization: GithubOrganization | null;
};

function parseOrganizationFilter() {
  return process.env.GITHUB_ORGANIZATIONS?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

async function fetchViewerOrganizations(
  octokit: Octokit,
): Promise<GithubOrganization[]> {
  const data = await octokit.graphql<ViewerOrganizationsResponse>(
    `
      query {
        viewer {
          organizations(first: 100) {
            nodes {
              login
              id
            }
          }
        }
      }
    `,
  );

  return data.viewer.organizations.nodes.filter(
    (org): org is GithubOrganization => org !== null,
  );
}

async function lookupOrganization(
  octokit: Octokit,
  login: string,
): Promise<GithubOrganization | null> {
  const data = await octokit.graphql<OrganizationLookupResponse>(
    `
      query ($login: String!) {
        organization(login: $login) {
          login
          id
        }
      }
    `,
    { login },
  );

  return data.organization;
}

export async function discoverGithubOrganizations(
  octokit = createGithubClient(),
): Promise<GithubOrganization[]> {
  const filter = parseOrganizationFilter();
  const discovered = await fetchViewerOrganizations(octokit);

  if (!filter?.length) {
    return discovered.sort((a, b) => a.login.localeCompare(b.login));
  }

  const filterSet = new Set(filter.map((login) => login.toLowerCase()));
  const matched = discovered.filter((org) =>
    filterSet.has(org.login.toLowerCase()),
  );
  const matchedLogins = new Set(
    matched.map((org) => org.login.toLowerCase()),
  );

  for (const login of filter) {
    if (matchedLogins.has(login.toLowerCase())) continue;

    const org = await lookupOrganization(octokit, login);
    if (org) {
      matched.push(org);
      matchedLogins.add(org.login.toLowerCase());
    }
  }

  return matched.sort((a, b) => a.login.localeCompare(b.login));
}
