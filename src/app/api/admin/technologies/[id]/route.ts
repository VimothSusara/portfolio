import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { prisma } from "@/lib/prisma";
import { technologyFormSchema } from "@/validations/technology";

type RouteContext = { params: Promise<{ id: string }> };

function revalidateTechnologyPaths() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/technologies");
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const technology = await prisma.technology.findUnique({
    where: { id },
    include: { _count: { select: { projects: true } } },
  });

  if (!technology) {
    return NextResponse.json({ error: "Technology not found" }, { status: 404 });
  }

  return NextResponse.json({ technology });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.technology.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Technology not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = technologyFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const technology = await prisma.technology.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category || null,
        iconName: data.iconName || null,
        iconUrl: data.iconUrl || null,
        websiteUrl: data.websiteUrl || null,
      },
      include: { _count: { select: { projects: true } } },
    });

    revalidateTechnologyPaths();

    return NextResponse.json({ technology });
  } catch (error) {
    console.error("Technology update error:", error);

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
      { error: "Failed to update technology" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.technology.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Technology not found" }, { status: 404 });
    }

    if (existing._count.projects > 0) {
      return NextResponse.json(
        {
          error: `This technology is used by ${existing._count.projects} project(s) and cannot be deleted`,
        },
        { status: 409 },
      );
    }

    await prisma.technology.delete({ where: { id } });

    revalidateTechnologyPaths();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Technology delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete technology" },
      { status: 500 },
    );
  }
}
