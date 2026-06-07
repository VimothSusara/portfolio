import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashValue } from "@/lib/hash";
import {
  VISITOR_COOKIE,
  VISITOR_COOKIE_MAX_AGE,
} from "@/lib/analytics/constants";

type VisitorContext = {
  ip: string;
  userAgent?: string;
  country?: string;
  city?: string;
};

export async function getOrCreateVisitorId(context: VisitorContext) {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(VISITOR_COOKIE)?.value;
  if (existingId) {
    const visitor = await prisma.visitor.findUnique({
      where: { id: existingId },
      select: { id: true },
    });
    if (visitor) return visitor.id;
  }
  const visitor = await prisma.visitor.create({
    data: {
      ipHash: hashValue(context.ip),
      userAgent: context.userAgent,
      country: context.country,
      city: context.city,
    },
    select: { id: true },
  });
  cookieStore.set(VISITOR_COOKIE, visitor.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VISITOR_COOKIE_MAX_AGE,
    path: "/",
  });
  return visitor.id;
}

export function getGeoFromHeaders(headerStore: Headers) {
  return {
    country: headerStore.get("x-vercel-ip-country") ?? undefined,
    city: headerStore.get("x-vercel-ip-city") ?? undefined,
  };
}
