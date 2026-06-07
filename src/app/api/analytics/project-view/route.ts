import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isLikelyBot } from "@/lib/analytics/bot-filter";

const bodySchema = z.object({
  projectId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const headerStore = await headers();
    const userAgent = headerStore.get("user-agent") ?? undefined;

    if (isLikelyBot(userAgent)) {
      return NextResponse.json({ tracked: false, reason: "bot" });
    }

    const { projectId } = bodySchema.parse(await request.json());

    const project = await prisma.project.findUnique({
      where: { id: projectId, status: "PUBLISHED" },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { tracked: false, reason: "not_found" },
        { status: 404 },
      );
    }

    await prisma.projectView.create({
      data: { projectId },
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Project view tracking error:", error);
    return NextResponse.json({ tracked: false }, { status: 400 });
  }
}
