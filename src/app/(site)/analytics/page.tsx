import type { Metadata } from "next";
import { ContributionGraph } from "@/components/site/contribution-graph";
import { GithubRepositoriesSection } from "@/components/site/github-repositories-section";
import { GithubRepositoryHistoryCharts } from "@/components/site/github-repository-history-charts";
import { LinkedProjectHistoryCharts } from "@/components/site/linked-project-history-charts";
import { OrganizationActivitySection } from "@/components/site/organization-activity-section";
import { FadeIn } from "@/components/motion/fade-in";
import { getGithubUsername } from "@/lib/github/client";
import {
  getContributionCalendarCache,
  getLatestOrganizationActivity,
  getLinkedProjectRepositoryHistories,
  getOrganizationRepositories,
  getRepositoryHistorySeries,
  parseContributionCalendar,
} from "@/lib/queries/github-analytics";

export const metadata: Metadata = {
  title: "Analytics",
  description: "GitHub activity and contribution history.",
};

export const revalidate = 3600;

export default async function AnalyticsPage() {
  const cache = await getContributionCalendarCache();
  const username = cache?.username ?? getGithubUsername();
  const calendar = parseContributionCalendar(cache);

  const [
    organizationActivity,
    organizationRepositories,
    linkedProjectHistories,
    repositoryHistory,
  ] = await Promise.all([
    getLatestOrganizationActivity(),
    getOrganizationRepositories(username),
    getLinkedProjectRepositoryHistories(),
    getRepositoryHistorySeries(5),
  ]);

  return (
    <section className="container mx-auto max-w-5xl space-y-12 px-4 py-16">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight">
          Developer analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          GitHub contribution activity
          {cache?.username ? ` for @${cache.username}` : ""}, including private
          work attributed to your profile.
        </p>
      </FadeIn>

      <FadeIn className="mt-10" delay={0.1}>
        {calendar ? (
          <ContributionGraph calendar={calendar} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No contribution data yet. Run a GitHub sync from the admin panel to
            populate this page.
          </p>
        )}
      </FadeIn>

      {linkedProjectHistories.length > 0 && (
        <FadeIn delay={0.12}>
          <LinkedProjectHistoryCharts histories={linkedProjectHistories} />
        </FadeIn>
      )}

      {repositoryHistory.length > 0 && (
        <FadeIn delay={0.14}>
          <GithubRepositoryHistoryCharts series={repositoryHistory} />
        </FadeIn>
      )}

      {organizationActivity.length > 0 && (
        <FadeIn delay={0.15}>
          <OrganizationActivitySection activities={organizationActivity} />
        </FadeIn>
      )}

      {organizationRepositories.length > 0 && (
        <FadeIn delay={0.2}>
          <GithubRepositoriesSection
            title="Organization repositories"
            description="Public, non-fork repositories from organizations you belong to."
            repositories={organizationRepositories}
          />
        </FadeIn>
      )}
    </section>
  );
}
