import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import {
  createPresignedUploadUrl,
  getMaxFileSizeForFolder,
} from "@/lib/supabase/storage";
import { uploadUrlSchema } from "@/validations/media";

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = uploadUrlSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const maxSize = getMaxFileSizeForFolder(parsed.data.folder);
    const contentLength = Number(request.headers.get("x-file-size") ?? 0);

    if (contentLength > maxSize) {
      const maxMb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `File too large (max ${maxMb}MB)` },
        { status: 400 },
      );
    }

    const upload = await createPresignedUploadUrl(parsed.data);

    return NextResponse.json(upload);
  } catch (error) {
    console.error("Upload URL error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create upload URL" },
      { status: 500 },
    );
  }
}