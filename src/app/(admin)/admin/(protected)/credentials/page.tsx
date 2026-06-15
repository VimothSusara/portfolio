import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { CredentialsTable } from "@/components/admin/credentials-table";
import { PlatformBadgesSyncButton } from "@/components/admin/platform-badges-sync-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminCredentials } from "@/lib/queries/admin-credentials";
import {
  getLastPlatformBadgesSyncJob,
  getPlatformProfileCaches,
  parseHackerRankStats,
  parseLeetCodeStats,
} from "@/lib/queries/platform-profiles";
import {
  getHackerRankUsername,
} from "@/lib/platforms/hackerrank";
import { getLeetCodeUsername } from "@/lib/platforms/leetcode";

export const metadata: Metadata = {
  title: "Credentials",
  robots: { index: false, follow: false },
};

export default async function AdminCredentialsPage() {
  const [credentials, lastSync, platformCaches] = await Promise.all([
    getAdminCredentials(),
    getLastPlatformBadgesSyncJob(),
    getPlatformProfileCaches(),
  ]);

  const leetcodeCache = platformCaches.find((cache) => cache.id === "leetcode");
  const hackerrankCache = platformCaches.find((cache) => cache.id === "hackerrank");
  const leetcodeStats = leetcodeCache ? parseLeetCodeStats(leetcodeCache.stats) : null;
  const hackerrankStats = hackerrankCache
    ? parseHackerRankStats(hackerrankCache.stats)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Credentials</h1>
          <p className="text-muted-foreground">
            Manage certifications, badges, and awards shown on your about page.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/credentials/new">
            <Plus className="size-4" />
            New credential
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform badge sync</CardTitle>
          <CardDescription>
            Pull public LeetCode and HackerRank badges into the database. Synced
            badges appear under Badges on the about page and can be removed only by
            re-syncing or deleting individually.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">LeetCode</p>
              <p className="mt-1 text-muted-foreground">
                {getLeetCodeUsername()
                  ? `@${getLeetCodeUsername()}`
                  : "LEETCODE_USERNAME not set"}
              </p>
              {leetcodeStats && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {leetcodeStats.totalSolved} solved · {leetcodeStats.badgeCount}{" "}
                  badges cached
                </p>
              )}
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">HackerRank</p>
              <p className="mt-1 text-muted-foreground">
                {getHackerRankUsername()
                  ? `@${getHackerRankUsername()}`
                  : "HACKERRANK_USERNAME not set"}
              </p>
              {hackerrankStats && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {hackerrankStats.totalBadges} badges · highest{" "}
                  {hackerrankStats.highestStar}★
                </p>
              )}
            </div>
          </div>

          <PlatformBadgesSyncButton
            lastSync={lastSync}
            leetcodeConfigured={Boolean(getLeetCodeUsername())}
            hackerrankConfigured={Boolean(getHackerRankUsername())}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All credentials</CardTitle>
          <CardDescription>
            Manual certifications use uploaded images. Synced platform badges use
            icons from LeetCode or text labels for HackerRank skill badges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CredentialsTable credentials={credentials} />
        </CardContent>
      </Card>
    </div>
  );
}
