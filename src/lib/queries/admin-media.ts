import { prisma } from "@/lib/prisma";
import {
  getMediaFolder,
  getMediaUsageSnapshot,
  isMediaInUse,
} from "@/lib/media/references";
import type { UploadFolder } from "@/lib/supabase/storage";

export type AdminMediaItem = {
  id: string;
  filename: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  fileSize: number | null;
  createdAt: Date;
  folder: UploadFolder | "other";
  inUse: boolean;
};

type ListMediaOptions = {
  folder?: UploadFolder | "all";
  search?: string;
  orphanOnly?: boolean;
  mimePrefix?: string;
  limit?: number;
};

export async function listAdminMedia(
  options: ListMediaOptions = {},
): Promise<AdminMediaItem[]> {
  const {
    folder = "all",
    search,
    orphanOnly = false,
    mimePrefix,
    limit = 100,
  } = options;

  const usage = await getMediaUsageSnapshot();

  const media = await prisma.media.findMany({
    where: {
      ...(mimePrefix ? { mimeType: { startsWith: mimePrefix } } : {}),
      ...(search
        ? {
            OR: [
              { filename: { contains: search, mode: "insensitive" } },
              { storagePath: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const items = media.map((item) => ({
    ...item,
    folder: getMediaFolder(item.storagePath),
    inUse: isMediaInUse(item, usage),
  }));

  return items.filter((item) => {
    if (folder !== "all" && item.folder !== folder) return false;
    if (orphanOnly && item.inUse) return false;
    return true;
  });
}

export async function getAdminMediaStats() {
  const usage = await getMediaUsageSnapshot();
  const media = await prisma.media.findMany({
    select: { id: true, publicUrl: true, storagePath: true },
  });

  let inUseCount = 0;
  for (const item of media) {
    if (isMediaInUse(item, usage)) inUseCount++;
  }

  return {
    total: media.length,
    inUse: inUseCount,
    orphans: media.length - inUseCount,
  };
}
