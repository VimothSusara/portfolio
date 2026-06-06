import { deleteStorageObject } from "@/lib/supabase/storage";
import { getMediaUsageSnapshot, isMediaInUse } from "@/lib/media/references";
import { prisma } from "@/lib/prisma";

export async function deleteMediaById(mediaId: string) {
  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media) {
    return { ok: false as const, error: "Media not found" };
  }

  const usage = await getMediaUsageSnapshot();
  if (isMediaInUse(media, usage)) {
    return {
      ok: false as const,
      error: "This file is still in use and cannot be deleted",
    };
  }

  try {
    await deleteStorageObject(media.storagePath);
  } catch (error) {
    console.error("Storage delete error:", error);
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : "Failed to delete storage object",
    };
  }

  await prisma.media.delete({ where: { id: mediaId } });

  return { ok: true as const };
}
