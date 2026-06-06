import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendContactEmails } from "@/lib/email/contact";
import { rateLimitContact } from "@/lib/rate-limit";
import { contactApiSchema } from "@/validations/contact";

const PROFILE_ID = "default";

function getClientIp(headerStore: Headers) {
  const forwarded = headerStore.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(request: Request) {
  try {
    const headerStore = await headers();
    const ip = getClientIp(headerStore);
    const userAgent = headerStore.get("user-agent") ?? undefined;

    const rateLimit = await rateLimitContact(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        },
      );
    }

    const body = await request.json();
    const parsed = contactApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Honeypot filled → pretend success (bot trap)
    if (parsed.data.website) {
      return NextResponse.json({ success: true });
    }

    const { website: _honeypot, ...data } = parsed.data;

    const profile = await prisma.profile.findUnique({
      where: { id: PROFILE_ID },
      select: { email: true },
    });

    const message = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject?.trim() || null,
        message: data.message,
        ipAddress: ip,
        userAgent,
        status: "PENDING",
      },
    });

    try {
      await sendContactEmails(data, profile?.email);
    } catch (emailError) {
      console.error("Contact email error:", emailError);
      // Message is saved; don't fail the request for email issues
    }

    return NextResponse.json(
      {
        success: true,
        id: message.id,
        message: "Your message has been sent successfully.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 },
    );
  }
}