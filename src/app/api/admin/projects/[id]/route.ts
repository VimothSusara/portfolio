import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { syncProjectMedia } from "@/lib/media/project-media";
import { prisma } from "@/lib/prisma";
import { projectFormSchema } from "@/validations/project";

type RouteContext = { params: Promise<{ id: string }> };

const projectInclude = {
  technologies: {
    include: { technology: true },
  },
  thumbnailImage: true,
  images: {
    orderBy: { sortOrder: "asc" as const },
    include: { media: true },
  },
};

function revalidateProjectPaths(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = projectFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const isPublished = data.status === "PUBLISHED";
    const wasPublished = existing.status === "PUBLISHED";

    const project = await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          title: data.title,
          slug: data.slug,
          shortDescription: data.shortDescription,
          description: data.description,
          githubUrl: data.githubUrl || null,
          liveUrl: data.liveUrl || null,
          featured: data.featured,
          status: data.status,
          lifecycle: data.lifecycle,
          type: data.type,
          sortOrder: data.sortOrder,
          publishedAt:
            isPublished && !existing.publishedAt ? new Date() : existing.publishedAt,
          technologies: {
            deleteMany: {},
            create: data.technologyIds.map((technologyId) => ({ technologyId })),
          },
        },
      });

      await syncProjectMedia(tx, id, data.thumbnail, data.gallery, admin.id);

      return tx.project.findUniqueOrThrow({
        where: { id },
        include: projectInclude,
      });
    });

    revalidateProjectPaths(project.slug);
    if (existing.slug !== project.slug && wasPublished) {
      revalidateProjectPaths(existing.slug);
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Project update error:", error);

    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "A project with this slug already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });

    revalidateProjectPaths(existing.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project delete error:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
