import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { syncProjectMedia } from "@/lib/media/project-media";
import { prisma } from "@/lib/prisma";
import { projectFormSchema } from "@/validations/project";

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

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: projectInclude,
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
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
          publishedAt: isPublished ? new Date() : null,
          technologies: {
            create: data.technologyIds.map((technologyId) => ({ technologyId })),
          },
        },
      });

      await syncProjectMedia(
        tx,
        created.id,
        data.thumbnail,
        data.gallery,
        admin.id,
      );

      return tx.project.findUniqueOrThrow({
        where: { id: created.id },
        include: projectInclude,
      });
    });

    if (isPublished) {
      revalidateProjectPaths(project.slug);
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Project create error:", error);

    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json({ error: "A project with this slug already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
