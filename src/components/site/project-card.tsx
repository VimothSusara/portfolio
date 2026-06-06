import Link from "next/link";
import Image from "next/image";
import { ProjectGithubStats } from "@/components/site/project-github-stats";
import { TechnologyBadge } from "@/components/site/technology-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { getPublishedProjects } from "@/lib/queries/projects";

type Project = Awaited<ReturnType<typeof getPublishedProjects>>[number];

export function ProjectCard({ project }: { project: Project }) {
  const thumbnail =
    project.thumbnailImage?.publicUrl ?? project.images[0]?.media.publicUrl;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/projects/${project.slug}`}>
        {thumbnail && (
          <div className="relative aspect-video w-full bg-muted">
            <Image src={thumbnail} alt={project.title} fill className="object-cover" />
          </div>
        )}
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {project.shortDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.githubRepository && (
            <ProjectGithubStats repository={project.githubRepository} compact />
          )}
          <div className="flex flex-wrap gap-2">
            {project.technologies.map(({ technology }) => (
              <TechnologyBadge key={technology.id} technology={technology} />
            ))}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
