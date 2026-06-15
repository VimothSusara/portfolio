import { randomUUID } from "crypto";
import { createSupabaseAdminClient, getStorageBucket } from "@/lib/supabase/server";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_RESUME_TYPES = new Set(["application/pdf"]);

export const UPLOAD_FOLDERS = ["profile", "projects", "resumes", "credentials"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

const FOLDER_CONFIG: Record<
  UploadFolder,
  { allowedTypes: Set<string>; maxSize: number; defaultExtension: string }
> = {
  profile: {
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: 5 * 1024 * 1024,
    defaultExtension: "jpg",
  },
  projects: {
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: 5 * 1024 * 1024,
    defaultExtension: "jpg",
  },
  resumes: {
    allowedTypes: ALLOWED_RESUME_TYPES,
    maxSize: 10 * 1024 * 1024,
    defaultExtension: "pdf",
  },
  credentials: {
    allowedTypes: ALLOWED_IMAGE_TYPES,
    maxSize: 5 * 1024 * 1024,
    defaultExtension: "png",
  },
};

type CreateUploadUrlInput = {
  filename: string;
  contentType: string;
  folder: UploadFolder;
};

export function getMaxFileSizeForFolder(folder: UploadFolder) {
  return FOLDER_CONFIG[folder].maxSize;
}

export function isAllowedUploadType(folder: UploadFolder, contentType: string) {
  return FOLDER_CONFIG[folder].allowedTypes.has(contentType);
}

export async function createPresignedUploadUrl(input: CreateUploadUrlInput) {
  const config = FOLDER_CONFIG[input.folder];

  if (!config.allowedTypes.has(input.contentType)) {
    throw new Error("Unsupported file type");
  }

  const extension = input.filename.split(".").pop()?.toLowerCase() ?? config.defaultExtension;
  const objectPath = `${input.folder}/${randomUUID()}.${extension}`;

  const supabase = createSupabaseAdminClient();
  const bucket = getStorageBucket();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create upload URL");
  }

  const { data: publicData } = supabase.storage
    .from(bucket)
    .getPublicUrl(objectPath);

  return {
    signedUrl: data.signedUrl,
    path: data.path,
    token: data.token,
    publicUrl: publicData.publicUrl,
    contentType: input.contentType,
  };
}

export async function deleteStorageObject(storagePath: string) {
  const supabase = createSupabaseAdminClient();
  const bucket = getStorageBucket();

  const { error } = await supabase.storage.from(bucket).remove([storagePath]);

  if (error) {
    throw new Error(error.message);
  }
}

// Backwards-compatible export for image uploads
export const MAX_FILE_SIZE = FOLDER_CONFIG.profile.maxSize;
export { ALLOWED_IMAGE_TYPES as ALLOWED_TYPES };