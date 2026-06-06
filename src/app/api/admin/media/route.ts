import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { registerMediaRecord } from "@/lib/media/register-media";
import { listAdminMedia } from "@/lib/queries/admin-media";
import { prisma } from "@/lib/prisma";
import type { UploadFolder } from "@/lib/supabase/storage";
import { registerMediaSchema } from "@/validations/media";

export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folder = searchParams.get("folder") as UploadFolder | "all" | null;
  const search = searchParams.get("search") ?? undefined;
  const orphanOnly = searchParams.get("orphanOnly") === "true";
  const mimePrefix = searchParams.get("mimePrefix") ?? undefined;

  const media = await listAdminMedia({
    folder: folder ?? "all",
    search,
    orphanOnly,
    mimePrefix,
  });

  return NextResponse.json({ media });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = registerMediaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const media = await prisma.$transaction((tx) =>
      registerMediaRecord(tx, parsed.data, admin.id),
    );

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    console.error("Register media error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register media" },
      { status: 500 },
    );
  }
}
