import type { Prisma } from "@/generated/prisma/client";
import { registerMediaRecord } from "@/lib/media/register-media";
import type { UploadFolder } from "@/lib/supabase/storage";
import type { ProjectMediaInput } from "@/validations/project";

function normalizeMediaInput(input: ProjectMediaInput) {
  const filename =
    input.filename ?? input.publicUrl.split("/").pop()?.split("?")[0] ?? "image";
  const storagePath = input.storagePath ?? input.publicUrl;
  const mimeType = input.mimeType ?? "image/jpeg";
  const folder: UploadFolder = storagePath.startsWith("projects/")
    ? "projects"
    : storagePath.startsWith("profile/")
      ? "profile"
      : storagePath.startsWith("resumes/")
        ? "resumes"
        : storagePath.startsWith("credentials/")
          ? "credentials"
          : "projects";
  return {
    filename,
    storagePath,
    mimeType,
    publicUrl: input.publicUrl,
    fileSize: input.fileSize ?? null,
    folder,
  };
}

export async function createMediaRecord(
  tx: Prisma.TransactionClient,
  input: ProjectMediaInput,
  uploadedById: string,
) {
  const normalized = normalizeMediaInput(input);

  return registerMediaRecord(
    tx,
    {
      filename: normalized.filename,
      storagePath: normalized.storagePath,
      publicUrl: normalized.publicUrl,
      mimeType: normalized.mimeType,
      fileSize: normalized.fileSize ?? undefined,
      folder: normalized.folder,
    },
    uploadedById,
  );
}

export async function syncProjectMedia(
  tx: Prisma.TransactionClient,
  projectId: string,
  thumbnail: ProjectMediaInput | null | undefined,
  gallery: ProjectMediaInput[],
  uploadedById: string,
) {
  if (thumbnail?.publicUrl) {
    const media = await createMediaRecord(tx, thumbnail, uploadedById);
    await tx.project.update({
      where: { id: projectId },
      data: { thumbnailImageId: media.id },
    });
  } else {
    await tx.project.update({
      where: { id: projectId },
      data: { thumbnailImageId: null },
    });
  }

  await tx.projectImage.deleteMany({ where: { projectId } });

  for (let index = 0; index < gallery.length; index++) {
    const item = gallery[index];
    if (!item?.publicUrl) continue;

    const media = await createMediaRecord(tx, item, uploadedById);
    await tx.projectImage.create({
      data: {
        projectId,
        mediaId: media.id,
        altText: item.altText ?? null,
        sortOrder: index,
      },
    });
  }
}