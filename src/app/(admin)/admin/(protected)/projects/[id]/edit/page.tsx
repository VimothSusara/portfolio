import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectForm } from "@/components/admin/project-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminProjectById, getAdminTechnologies } from "@/lib/queries/admin-projects";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getAdminProjectById(id);
  return { title: project ? `Edit ${project.title}` : "Edit project" };
}

export default async function AdminEditProjectPage({ params }: Props) {
  const { id } = await params;

  const [project, technologies] = await Promise.all([
    getAdminProjectById(id),
    getAdminTechnologies(),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit project</h1>
        <p className="text-muted-foreground">{project.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm
            mode="edit"
            projectId={project.id}
            technologies={technologies}
            defaultValues={{
              title: project.title,
              slug: project.slug,
              shortDescription: project.shortDescription,
              description: project.description,
              githubUrl: project.githubUrl ?? "",
              liveUrl: project.liveUrl ?? "",
              featured: project.featured,
              status: project.status,
              lifecycle: project.lifecycle,
              type: project.type,
              sortOrder: project.sortOrder,
              technologyIds: project.technologies.map((t) => t.technologyId),
              thumbnail: project.thumbnailImage
                ? {
                    publicUrl: project.thumbnailImage.publicUrl,
                    storagePath: project.thumbnailImage.storagePath,
                    filename: project.thumbnailImage.filename,
                    mimeType: project.thumbnailImage.mimeType,
                    fileSize: project.thumbnailImage.fileSize ?? undefined,
                  }
                : null,
              gallery: project.images.map((image) => ({
                publicUrl: image.media.publicUrl,
                storagePath: image.media.storagePath,
                filename: image.media.filename,
                mimeType: image.media.mimeType,
                fileSize: image.media.fileSize ?? undefined,
                altText: image.altText ?? undefined,
              })),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}