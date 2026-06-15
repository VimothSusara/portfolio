import { prisma } from "@/lib/prisma";
import {
  fetchHackerRankBadges,
  getHackerRankBadgeTitle,
  getHackerRankProfileUrl,
  getHackerRankUsername,
} from "@/lib/platforms/hackerrank";
import {
  fetchLeetCodeProfile,
  getLeetCodeProfileUrl,
  getLeetCodeUsername,
  parseLeetCodeCreationDate,
} from "@/lib/platforms/leetcode";
import type { PlatformBadgeSyncSummary } from "@/lib/platforms/types";

async function upsertLeetCodeBadges(result: Awaited<ReturnType<typeof fetchLeetCodeProfile>>) {
  const now = new Date();
  const externalIds: string[] = [];

  for (const [index, badge] of result.badges.entries()) {
    externalIds.push(badge.id);

    await prisma.credential.upsert({
      where: {
        source_externalId: {
          source: "LEETCODE",
          externalId: badge.id,
        },
      },
      update: {
        title: badge.displayName,
        issuer: "LeetCode",
        description: badge.hoverText ?? null,
        type: "BADGE",
        iconUrl: badge.icon || null,
        credentialUrl: getLeetCodeProfileUrl(result.username),
        issuedAt: parseLeetCodeCreationDate(badge.creationDate),
        sortOrder: index,
        published: true,
        lastSyncedAt: now,
        metadata: {
          name: badge.name,
          hoverText: badge.hoverText,
        },
      },
      create: {
        title: badge.displayName,
        issuer: "LeetCode",
        description: badge.hoverText ?? null,
        type: "BADGE",
        source: "LEETCODE",
        externalId: badge.id,
        iconUrl: badge.icon || null,
        credentialUrl: getLeetCodeProfileUrl(result.username),
        issuedAt: parseLeetCodeCreationDate(badge.creationDate),
        sortOrder: index,
        published: true,
        lastSyncedAt: now,
        metadata: {
          name: badge.name,
          hoverText: badge.hoverText,
        },
      },
    });
  }

  if (externalIds.length > 0) {
    await prisma.credential.deleteMany({
      where: {
        source: "LEETCODE",
        externalId: { notIn: externalIds },
      },
    });
  }

  await prisma.platformProfileCache.upsert({
    where: { id: "leetcode" },
    update: {
      platform: "LEETCODE",
      username: result.username,
      stats: result.stats,
    },
    create: {
      id: "leetcode",
      platform: "LEETCODE",
      username: result.username,
      stats: result.stats,
    },
  });

  return result.badges.length;
}

async function upsertHackerRankBadges(result: Awaited<ReturnType<typeof fetchHackerRankBadges>>) {
  const now = new Date();
  const externalIds: string[] = [];

  for (const [index, badge] of result.badges.entries()) {
    externalIds.push(badge.id);

    await prisma.credential.upsert({
      where: {
        source_externalId: {
          source: "HACKERRANK",
          externalId: badge.id,
        },
      },
      update: {
        title: getHackerRankBadgeTitle(badge),
        issuer: "HackerRank",
        description:
          badge.stars > 0
            ? `${badge.badgeName} skill badge with ${badge.stars} star${badge.stars === 1 ? "" : "s"}.`
            : badge.badgeName,
        type: "BADGE",
        credentialUrl: getHackerRankProfileUrl(result.username),
        sortOrder: index,
        published: true,
        lastSyncedAt: now,
        metadata: {
          badgeType: badge.badgeType,
          stars: badge.stars,
          level: badge.level,
          points: badge.points,
        },
      },
      create: {
        title: getHackerRankBadgeTitle(badge),
        issuer: "HackerRank",
        description:
          badge.stars > 0
            ? `${badge.badgeName} skill badge with ${badge.stars} star${badge.stars === 1 ? "" : "s"}.`
            : badge.badgeName,
        type: "BADGE",
        source: "HACKERRANK",
        externalId: badge.id,
        credentialUrl: getHackerRankProfileUrl(result.username),
        sortOrder: index,
        published: true,
        lastSyncedAt: now,
        metadata: {
          badgeType: badge.badgeType,
          stars: badge.stars,
          level: badge.level,
          points: badge.points,
        },
      },
    });
  }

  if (externalIds.length > 0) {
    await prisma.credential.deleteMany({
      where: {
        source: "HACKERRANK",
        externalId: { notIn: externalIds },
      },
    });
  }

  await prisma.platformProfileCache.upsert({
    where: { id: "hackerrank" },
    update: {
      platform: "HACKERRANK",
      username: result.username,
      stats: result.stats,
    },
    create: {
      id: "hackerrank",
      platform: "HACKERRANK",
      username: result.username,
      stats: result.stats,
    },
  });

  return result.badges.length;
}

export async function runPlatformBadgesSync(): Promise<PlatformBadgeSyncSummary> {
  const leetcodeUsername = getLeetCodeUsername();
  const hackerrankUsername = getHackerRankUsername();

  if (!leetcodeUsername && !hackerrankUsername) {
    throw new Error(
      "Set LEETCODE_USERNAME and/or HACKERRANK_USERNAME in environment variables",
    );
  }

  const job = await prisma.syncJobRun.create({
    data: { type: "PLATFORM_BADGES", status: "RUNNING" },
  });

  const errors: string[] = [];
  let leetcodeResult: Awaited<ReturnType<typeof fetchLeetCodeProfile>> | null = null;
  let hackerrankResult: Awaited<ReturnType<typeof fetchHackerRankBadges>> | null = null;
  let leetcodeBadgeCount = 0;
  let hackerrankBadgeCount = 0;

  try {
    if (leetcodeUsername) {
      try {
        leetcodeResult = await fetchLeetCodeProfile(leetcodeUsername);
        leetcodeBadgeCount = await upsertLeetCodeBadges(leetcodeResult);
      } catch (error) {
        errors.push(
          `LeetCode: ${error instanceof Error ? error.message : "sync failed"}`,
        );
      }
    }

    if (hackerrankUsername) {
      try {
        hackerrankResult = await fetchHackerRankBadges(hackerrankUsername);
        hackerrankBadgeCount = await upsertHackerRankBadges(hackerrankResult);
      } catch (error) {
        errors.push(
          `HackerRank: ${error instanceof Error ? error.message : "sync failed"}`,
        );
      }
    }

    if (!leetcodeResult && !hackerrankResult) {
      throw new Error(errors.join(" · "));
    }

    const hasPartialErrors = errors.length > 0;

    await prisma.syncJobRun.update({
      where: { id: job.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        errorMessage: hasPartialErrors ? errors.join(" · ") : null,
        metadata: {
          leetcodeUsername,
          hackerrankUsername,
          leetcodeBadgeCount,
          hackerrankBadgeCount,
          partialErrors: errors,
          partialSuccess: hasPartialErrors,
        },
      },
    });

    return {
      leetcode: leetcodeResult,
      hackerrank: hackerrankResult,
      leetcodeBadgeCount,
      hackerrankBadgeCount,
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
