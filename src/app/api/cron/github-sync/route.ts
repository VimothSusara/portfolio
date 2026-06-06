import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { runGithubSync } from "@/lib/github/sync";

export async function POST(request: Request) {
  const secret = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (!expected || secret !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runGithubSync();
    revalidatePath("/analytics");
    revalidatePath("/admin/analytics");
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("GitHub sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 },
    );
  }
}
