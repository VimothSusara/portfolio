import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { prisma } from "@/lib/prisma";
import { technologyFormSchema } from "@/validations/technology";

function revalidateTechnologyPaths() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/technologies");
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const technologies = await prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { projects: true } },
    },
  });

  return NextResponse.json({ technologies });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = technologyFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const technology = await prisma.technology.create({
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category || null,
        iconName: data.iconName || null,
        iconUrl: data.iconUrl || null,
        websiteUrl: data.websiteUrl || null,
      },
      include: {
        _count: { select: { projects: true } },
      },
    });

    revalidateTechnologyPaths();

    return NextResponse.json({ technology }, { status: 201 });
  } catch (error) {
    console.error("Technology create error:", error);

    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A technology with this name or slug already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to create technology" },
      { status: 500 },
    );
  }
}
