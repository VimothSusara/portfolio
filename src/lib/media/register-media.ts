import type { Prisma } from "@/generated/prisma/client";
import type { RegisterMediaInput } from "@/validations/media";

export async function registerMediaRecord(
  tx: Prisma.TransactionClient,
  input: RegisterMediaInput,
  uploadedById: string,
) {
  const existing = await tx.media.findFirst({
    where: {
      OR: [{ storagePath: input.storagePath }, { publicUrl: input.publicUrl }],
    },
  });

  if (existing) {
    return existing;
  }

  return tx.media.create({
    data: {
      filename: input.filename,
      storagePath: input.storagePath,
      publicUrl: input.publicUrl,
      mimeType: input.mimeType,
      fileSize: input.fileSize ?? null,
      uploadedById,
    },
  });
}
