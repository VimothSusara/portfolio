import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashValue } from "@/lib/hash";

const PROFILE_ID = "default";

export async function GET() {
  const profile = await prisma.profile.findUnique({
    where: { id: PROFILE_ID },
    select: { resumeUrl: true },
  });

  if (!profile?.resumeUrl) {
    return NextResponse.json({ error: "Resume not available" }, { status: 404 });
  }

  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  await prisma.resumeDownload.create({
    data: {
      ipHash: hashValue(ip),
    },
  });

  return NextResponse.redirect(profile.resumeUrl);
}