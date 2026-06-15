import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { runPlatformBadgesSync } from "@/lib/platforms/sync-badges";

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPlatformBadgesSync();
    revalidatePath("/about");
    revalidatePath("/admin/credentials");

    return NextResponse.json({
      success: true,
      message: "Platform badges synced successfully",
      ...result,
    });
  } catch (error) {
    console.error("Platform badges sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}
