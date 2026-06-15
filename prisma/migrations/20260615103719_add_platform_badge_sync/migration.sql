-- AlterEnum
ALTER TYPE "CredentialSource" ADD VALUE 'HACKERRANK';

-- AlterEnum
ALTER TYPE "SyncJobType" ADD VALUE 'PLATFORM_BADGES';

-- CreateTable
CREATE TABLE "PlatformProfileCache" (
    "id" TEXT NOT NULL,
    "platform" "CredentialSource" NOT NULL,
    "username" TEXT NOT NULL,
    "stats" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformProfileCache_pkey" PRIMARY KEY ("id")
);
