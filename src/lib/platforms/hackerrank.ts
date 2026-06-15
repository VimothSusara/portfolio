import type { HackerRankBadge, HackerRankSyncResult } from "@/lib/platforms/types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

type HackerRankBadgeModel = {
  badge_name?: string;
  badge_type?: string;
  stars?: number;
  total_stars?: number;
  level?: number | string;
  total_points?: number;
  current_points?: number;
};

type HackerRankBadgesResponse = {
  status?: boolean;
  /** Current API (v2) */
  models?: HackerRankBadgeModel[];
  /** Legacy shape used by some docs/examples */
  data?: HackerRankBadgeModel[];
};

export function getHackerRankUsername() {
  return process.env.HACKERRANK_USERNAME?.trim() || null;
}

function extractBadgeModels(payload: HackerRankBadgesResponse) {
  if (Array.isArray(payload.models)) return payload.models;
  if (Array.isArray(payload.data)) return payload.data;
  return null;
}

export async function fetchHackerRankBadges(username: string): Promise<HackerRankSyncResult> {
  const response = await fetch(
    `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/badges`,
    {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    },
  );

  if (response.status === 404) {
    throw new Error(`HackerRank user "${username}" not found`);
  }

  if (!response.ok) {
    throw new Error(`HackerRank API returned ${response.status}`);
  }

  const payload = (await response.json()) as HackerRankBadgesResponse;
  const models = extractBadgeModels(payload);

  if (!payload.status || models === null) {
    throw new Error(`HackerRank user "${username}" not found or badges unavailable`);
  }

  const badges: HackerRankBadge[] = models.map((badge) => ({
    id: badge.badge_type ?? badge.badge_name ?? "badge",
    badgeName: badge.badge_name ?? "Badge",
    badgeType: badge.badge_type ?? badge.badge_name ?? "badge",
    stars: badge.stars ?? 0,
    level: String(badge.level ?? ""),
    points: badge.current_points ?? badge.total_points ?? 0,
  }));

  const highestStar = badges.reduce((max, badge) => Math.max(max, badge.stars), 0);
  const totalPoints = badges.reduce((sum, badge) => sum + badge.points, 0);

  return {
    username,
    badges,
    stats: {
      totalBadges: badges.length,
      highestStar,
      totalPoints: Math.round(totalPoints),
    },
  };
}

export function getHackerRankProfileUrl(username: string) {
  return `https://www.hackerrank.com/${username}`;
}

export function getHackerRankBadgeTitle(badge: HackerRankBadge) {
  if (badge.stars > 0) {
    return `${badge.badgeName} (${badge.stars}★)`;
  }
  return badge.badgeName;
}
