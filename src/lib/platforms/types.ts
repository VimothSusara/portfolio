import type { CredentialSource } from "@/generated/prisma/client";

export type LeetCodeBadge = {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  hoverText?: string;
  creationDate?: string;
};

export type LeetCodeProfileStats = {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  ranking: number | null;
  badgeCount: number;
};

export type LeetCodeSyncResult = {
  username: string;
  badges: LeetCodeBadge[];
  stats: LeetCodeProfileStats;
};

export type HackerRankBadge = {
  id: string;
  badgeName: string;
  badgeType: string;
  stars: number;
  level: string;
  points: number;
};

export type HackerRankProfileStats = {
  totalBadges: number;
  highestStar: number;
  totalPoints: number;
};

export type HackerRankSyncResult = {
  username: string;
  badges: HackerRankBadge[];
  stats: HackerRankProfileStats;
};

export type PlatformBadgeSyncSummary = {
  leetcode: LeetCodeSyncResult | null;
  hackerrank: HackerRankSyncResult | null;
  leetcodeBadgeCount: number;
  hackerrankBadgeCount: number;
};

export type PlatformProfileStats = {
  platform: CredentialSource;
  username: string;
  stats: LeetCodeProfileStats | HackerRankProfileStats;
};
