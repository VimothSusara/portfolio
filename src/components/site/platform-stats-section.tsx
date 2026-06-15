import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getPlatformProfileCaches,
  parseHackerRankStats,
  parseLeetCodeStats,
} from "@/lib/queries/platform-profiles";
import {
  getHackerRankProfileUrl,
} from "@/lib/platforms/hackerrank";
import { getLeetCodeProfileUrl } from "@/lib/platforms/leetcode";

export async function PlatformStatsSection() {
  const caches = await getPlatformProfileCaches();

  if (caches.length === 0) return null;

  const leetcode = caches.find((cache) => cache.id === "leetcode");
  const hackerrank = caches.find((cache) => cache.id === "hackerrank");
  const leetcodeStats = leetcode ? parseLeetCodeStats(leetcode.stats) : null;
  const hackerrankStats = hackerrank ? parseHackerRankStats(hackerrank.stats) : null;

  if (!leetcodeStats && !hackerrankStats) return null;

  return (
    <FadeIn className="mt-16">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Coding platforms</h2>
        <p className="mt-2 text-muted-foreground">
        Stats from public profiles.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {leetcode && leetcodeStats && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">LeetCode</CardTitle>
              <CardDescription>@{leetcode.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Solved</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {leetcodeStats.totalSolved}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Badges</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {leetcodeStats.badgeCount}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Easy {leetcodeStats.easy} · Medium {leetcodeStats.medium} · Hard{" "}
                {leetcodeStats.hard}
                {leetcodeStats.ranking
                  ? ` · Rank #${leetcodeStats.ranking.toLocaleString()}`
                  : ""}
              </p>
              <Link
                href={getLeetCodeProfileUrl(leetcode.username)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
                View profile
              </Link>
            </CardContent>
          </Card>
        )}

        {hackerrank && hackerrankStats && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">HackerRank</CardTitle>
              <CardDescription>@{hackerrank.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Badges</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {hackerrankStats.totalBadges}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Highest star</p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {hackerrankStats.highestStar}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {hackerrankStats.totalPoints.toLocaleString()} total badge points
              </p>
              <Link
                href={getHackerRankProfileUrl(hackerrank.username)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="size-3.5" />
                View profile
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </FadeIn>
  );
}
