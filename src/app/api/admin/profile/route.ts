import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { prisma } from "@/lib/prisma";
import { profileFormSchema } from "@/validations/profile";

const PROFILE_ID = "default";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: PROFILE_ID },
  });

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = profileFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const profile = await prisma.profile.upsert({
      where: { id: PROFILE_ID },
      update: {
        fullName: data.fullName,
        title: data.title,
        shortBio: data.shortBio,
        longBio: data.longBio,
        email: data.email,
        location: data.location || null,
        resumeUrl: data.resumeUrl || null,
        avatarUrl: data.avatarUrl || null,
        heroImageUrl: data.heroImageUrl || null,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        twitterUrl: data.twitterUrl || null,
        websiteUrl: data.websiteUrl || null,
      },
      create: {
        id: PROFILE_ID,
        fullName: data.fullName,
        title: data.title,
        shortBio: data.shortBio,
        longBio: data.longBio,
        email: data.email,
        location: data.location || null,
        resumeUrl: data.resumeUrl || null,
        avatarUrl: data.avatarUrl || null,
        heroImageUrl: data.heroImageUrl || null,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        twitterUrl: data.twitterUrl || null,
        websiteUrl: data.websiteUrl || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}