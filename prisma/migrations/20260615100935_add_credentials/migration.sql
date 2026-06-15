-- CreateEnum
CREATE TYPE "CredentialType" AS ENUM ('CERTIFICATION', 'BADGE', 'AWARD');

-- CreateEnum
CREATE TYPE "CredentialSource" AS ENUM ('MANUAL', 'LEETCODE');

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "description" TEXT,
    "type" "CredentialType" NOT NULL,
    "source" "CredentialSource" NOT NULL DEFAULT 'MANUAL',
    "externalId" TEXT,
    "credentialUrl" TEXT,
    "iconUrl" TEXT,
    "imageId" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Credential_type_published_sortOrder_idx" ON "Credential"("type", "published", "sortOrder");

-- CreateIndex
CREATE INDEX "Credential_published_featured_idx" ON "Credential"("published", "featured");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_source_externalId_key" ON "Credential"("source", "externalId");

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
