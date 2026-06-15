import type { UploadFolder } from "@/lib/supabase/storage";
import type { ProjectMediaInput } from "@/validations/project";

export type RegisteredMedia = ProjectMediaInput & {
  id: string;
};

type UploadMediaFileOptions = {
  file: File;
  folder: UploadFolder;
};

export async function uploadAndRegisterMedia({
  file,
  folder,
}: UploadMediaFileOptions): Promise<RegisteredMedia> {
  const presignResponse = await fetch("/api/admin/media/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-file-size": String(file.size),
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder,
    }),
  });

  const presignData = await presignResponse.json();
  if (!presignResponse.ok) {
    throw new Error(presignData.error ?? "Failed to get upload URL");
  }

  const uploadResponse = await fetch(presignData.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Upload failed");
  }

  const registerResponse = await fetch("/api/admin/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      storagePath: presignData.path,
      publicUrl: presignData.publicUrl,
      mimeType: file.type,
      fileSize: file.size,
      folder,
    }),
  });

  const registerData = await registerResponse.json();
  if (!registerResponse.ok) {
    throw new Error(registerData.error ?? "Failed to register media");
  }

  return {
    id: registerData.media.id,
    publicUrl: registerData.media.publicUrl,
    storagePath: registerData.media.storagePath,
    filename: registerData.media.filename,
    mimeType: registerData.media.mimeType,
    fileSize: registerData.media.fileSize ?? file.size,
  };
}

export type MediaPickerItem = {
  id: string;
  filename: string;
  publicUrl: string;
  storagePath: string;
  mimeType: string;
  fileSize: number | null;
  inUse: boolean;
};

export async function fetchMediaLibrary(options?: {
  folder?: UploadFolder | "all";
  mimePrefix?: string;
  orphanOnly?: boolean;
  search?: string;
}) {
  const params = new URLSearchParams();
  if (options?.folder && options.folder !== "all") {
    params.set("folder", options.folder);
  }
  if (options?.mimePrefix) params.set("mimePrefix", options.mimePrefix);
  if (options?.orphanOnly) params.set("orphanOnly", "true");
  if (options?.search) params.set("search", options.search);

  const response = await fetch(`/api/admin/media?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to load media");
  }

  return data.media as MediaPickerItem[];
}

export function mediaToProjectInput(media: MediaPickerItem): ProjectMediaInput & {
  id?: string;
} {
  return {
    id: media.id,
    publicUrl: media.publicUrl,
    storagePath: media.storagePath,
    filename: media.filename,
    mimeType: media.mimeType,
    fileSize: media.fileSize ?? undefined,
  };
}
