const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const BADGES_QUERY = `
  query userBadges($username: String!) {
    matchedUser(username: $username) {
      badges {
        id
        name
        displayName
        icon
        hoverText
        creationDate
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      profile {
        ranking
      }
    }
  }
`;

type LeetCodeGraphQLResponse = {
  data?: {
    matchedUser?: {
      badges?: Array<{
        id: string;
        name: string;
        displayName: string;
        icon: string;
        hoverText?: string;
        creationDate?: string;
      }>;
      submitStats?: {
        acSubmissionNum?: Array<{
          difficulty: string;
          count: number;
        }>;
      };
      profile?: {
        ranking?: number | null;
      } | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
};

export function getLeetCodeUsername() {
  return process.env.LEETCODE_USERNAME?.trim() || null;
}

export async function fetchLeetCodeProfile(username: string) {
  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({
      query: BADGES_QUERY,
      variables: { username },
      operationName: "userBadges",
    }),
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`LeetCode API returned ${response.status}`);
  }

  const payload = (await response.json()) as LeetCodeGraphQLResponse;

  if (payload.errors?.length) {
    throw new Error(payload.errors[0]?.message ?? "LeetCode GraphQL error");
  }

  const user = payload.data?.matchedUser;
  if (!user) {
    throw new Error(`LeetCode user "${username}" not found`);
  }

  const badges = (user.badges ?? []).map((badge) => ({
    id: String(badge.id),
    name: badge.name,
    displayName: badge.displayName,
    icon: badge.icon,
    hoverText: badge.hoverText,
    creationDate: badge.creationDate,
  }));

  const counts = { easy: 0, medium: 0, hard: 0, total: 0 };
  for (const entry of user.submitStats?.acSubmissionNum ?? []) {
    const difficulty = entry.difficulty.toLowerCase();
    if (difficulty === "easy") counts.easy = entry.count;
    if (difficulty === "medium") counts.medium = entry.count;
    if (difficulty === "hard") counts.hard = entry.count;
    if (difficulty === "all") counts.total = entry.count;
  }

  if (counts.total === 0) {
    counts.total = counts.easy + counts.medium + counts.hard;
  }

  return {
    username,
    badges,
    stats: {
      totalSolved: counts.total,
      easy: counts.easy,
      medium: counts.medium,
      hard: counts.hard,
      ranking: user.profile?.ranking ?? null,
      badgeCount: badges.length,
    },
  };
}

export function getLeetCodeProfileUrl(username: string) {
  return `https://leetcode.com/u/${username}/`;
}

export function parseLeetCodeCreationDate(value?: string) {
  if (!value) return null;
  const timestamp = Number(value);
  if (Number.isNaN(timestamp)) return null;
  const ms = timestamp > 1_000_000_000_000 ? timestamp : timestamp * 1000;
  return new Date(ms);
}
