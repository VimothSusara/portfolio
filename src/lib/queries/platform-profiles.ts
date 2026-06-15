import { prisma } from "@/lib/prisma";
import type {
  HackerRankProfileStats,
  LeetCodeProfileStats,
} from "@/lib/platforms/types";

export async function getPlatformProfileCaches() {
  return prisma.platformProfileCache.findMany({
    orderBy: { id: "asc" },
  });
}

export async function getLastPlatformBadgesSyncJob() {
  return prisma.syncJobRun.findFirst({
    where: { type: "PLATFORM_BADGES" },
    orderBy: { startedAt: "desc" },
  });
}

export function parseLeetCodeStats(stats: unknown): LeetCodeProfileStats | null {
  if (!stats || typeof stats !== "object") return null;
  const value = stats as Partial<LeetCodeProfileStats>;
  if (typeof value.totalSolved !== "number") return null;
  return {
    totalSolved: value.totalSolved,
    easy: value.easy ?? 0,
    medium: value.medium ?? 0,
    hard: value.hard ?? 0,
    ranking: value.ranking ?? null,
    badgeCount: value.badgeCount ?? 0,
  };
}

export function parseHackerRankStats(stats: unknown): HackerRankProfileStats | null {
  if (!stats || typeof stats !== "object") return null;
  const value = stats as Partial<HackerRankProfileStats>;
  if (typeof value.totalBadges !== "number") return null;
  return {
    totalBadges: value.totalBadges,
    highestStar: value.highestStar ?? 0,
    totalPoints: value.totalPoints ?? 0,
  };
}
