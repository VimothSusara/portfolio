-- CreateTable
CREATE TABLE "GithubContributionCache" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "username" TEXT NOT NULL,
    "totalContributions" INTEGER NOT NULL,
    "weeks" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GithubContributionCache_pkey" PRIMARY KEY ("id")
);
