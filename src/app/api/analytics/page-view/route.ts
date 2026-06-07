import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp } from "@/lib/rate-limit";
import { isLikelyBot } from "@/lib/analytics/bot-filter";
import { isTrackablePath } from "@/lib/analytics/constants";
import {
  getGeoFromHeaders,
  getOrCreateVisitorId,
} from "@/lib/analytics/visitor";

const bodySchema = z.object({
  path: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    const headerStore = await headers();
    const userAgent = headerStore.get("user-agent") ?? undefined;
    if (isLikelyBot(userAgent)) {
      return NextResponse.json({ tracked: false, reason: "bot" });
    }
    const json = await request.json();
    const { path } = bodySchema.parse(json);
    if (!isTrackablePath(path)) {
      return NextResponse.json({ tracked: false, reason: "path" });
    }
    const ip = getClientIp(headerStore);
    const geo = getGeoFromHeaders(headerStore);
    const visitorId = await getOrCreateVisitorId({
      ip,
      userAgent,
      ...geo,
    });
    await prisma.pageView.create({
      data: {
        path,
        visitorId,
      },
    });
    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error("Page view tracking error:", error);
    return NextResponse.json({ tracked: false }, { status: 400 });
  }
}
