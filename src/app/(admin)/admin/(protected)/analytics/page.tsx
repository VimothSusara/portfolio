import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GithubSyncButton } from "@/components/admin/github-sync-button";
import { ContributionGraph } from "@/components/site/contribution-graph";
import { GithubRepositoriesSection } from "@/components/site/github-repositories-section";
import { OrganizationActivitySection } from "@/components/site/organization-activity-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGithubUsername } from "@/lib/github/client";
import {
  getContributionCalendarCache,
  getGithubRepositoryCounts,
  getLastGithubSyncJob,
  getLatestOrganizationActivity,
  getOrganizationRepositories,
  parseContributionCalendar,
} from "@/lib/queries/github-analytics";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}

export default async function AdminAnalyticsPage() {
  const cache = await getContributionCalendarCache();
  const username = cache?.username ?? getGithubUsername();

  const [
    lastSync,
    repoCounts,
    organizationActivity,
    organizationRepositories,
  ] = await Promise.all([
    getLastGithubSyncJob(),
    getGithubRepositoryCounts(username),
    getLatestOrganizationActivity(),
    getOrganizationRepositories(username),
  ]);

  const calendar = parseContributionCalendar(cache);
  const githubConfigured = Boolean(process.env.GITHUB_TOKEN);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            GitHub analytics
          </h1>
          <p className="text-muted-foreground">
            Sync contribution data, organization activity, and repository stats
            for the public analytics page.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/analytics" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            View public page
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>GitHub token</CardDescription>
            <CardTitle className="text-base">
              {githubConfigured ? (
                <Badge variant="default">Configured</Badge>
              ) : (
                <Badge variant="destructive">Missing</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Requires <code className="rounded bg-muted px-1">read:org</code>{" "}
            scope for organization sync
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cached contributions</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {cache?.totalContributions?.toLocaleString() ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {cache?.username ? `@${cache.username}` : "No cache yet"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tracked repositories</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {repoCounts.total}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {repoCounts.personal} personal · {repoCounts.organization} public
            org
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Organizations</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {organizationActivity.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Auto-discovered from your GitHub memberships
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manual sync</CardTitle>
          <CardDescription>
            Pulls your contribution calendar, organization activity, and
            repository stats into the database. Organizations are auto-discovered
            from your token; optionally restrict with{" "}
            <code className="rounded bg-muted px-1">GITHUB_ORGANIZATIONS</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GithubSyncButton
            lastSync={
              lastSync
                ? {
                    status: lastSync.status,
                    startedAt: lastSync.startedAt,
                    finishedAt: lastSync.finishedAt,
                    errorMessage: lastSync.errorMessage,
                  }
                : null
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contribution preview</CardTitle>
          <CardDescription>
            Same graph shown on{" "}
            <Link href="/analytics" className="underline underline-offset-4">
              /analytics
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          {calendar ? (
            <ContributionGraph calendar={calendar} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No data yet. Configure{" "}
              <code className="rounded bg-muted px-1">GITHUB_TOKEN</code> and{" "}
              <code className="rounded bg-muted px-1">GITHUB_USERNAME</code>,
              then click &quot;Sync GitHub now&quot;.
            </p>
          )}
        </CardContent>
      </Card>

      {organizationActivity.length > 0 && (
        <OrganizationActivitySection activities={organizationActivity} />
      )}

      {organizationRepositories.length > 0 && (
        <GithubRepositoriesSection
          title="Organization repositories"
          description="Public, non-fork repositories synced from organizations you belong to."
          repositories={organizationRepositories}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Last cache update</CardTitle>
          <CardDescription>
            Public page reads from cached contribution data
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {formatDate(cache?.updatedAt)}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment variables</CardTitle>
          <CardDescription>Required for sync to work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <code className="rounded bg-muted px-1">GITHUB_TOKEN</code> —
            Personal Access Token with{" "}
            <code className="rounded bg-muted px-1">read:org</code> (and{" "}
            <code className="rounded bg-muted px-1">repo</code> for private
            repos)
          </p>
          <p>
            <code className="rounded bg-muted px-1">GITHUB_USERNAME</code> —
            Your GitHub handle (e.g.{" "}
            <code className="rounded bg-muted px-1">vimothsusara</code>)
          </p>
          <p>
            <code className="rounded bg-muted px-1">GITHUB_ORGANIZATIONS</code>{" "}
            — Optional comma-separated allowlist (e.g.{" "}
            <code className="rounded bg-muted px-1">acme,startup</code>). If
            unset, all visible organizations are synced.
          </p>
          <p>
            <code className="rounded bg-muted px-1">CRON_SECRET</code> — Only
            for automated Vercel cron at{" "}
            <code className="rounded bg-muted px-1">/api/cron/github-sync</code>{" "}
            (not needed for manual sync)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
