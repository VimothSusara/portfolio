import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { runGithubSync } from "@/lib/github/sync";

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runGithubSync();
    revalidatePath("/analytics");
    revalidatePath("/admin/analytics");

    return NextResponse.json({
      success: true,
      message: "GitHub data synced successfully",
      ...result,
    });
  } catch (error) {
    console.error("Admin GitHub sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}
