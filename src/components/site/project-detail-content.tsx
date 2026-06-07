"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { ProjectGithubStats } from "@/components/site/project-github-stats";
import { TechnologyBadge } from "@/components/site/technology-icon";
import type { getProjectBySlug } from "@/lib/queries/projects";
import { ProjectViewTracker } from "@/components/site/project-view-tracker";

type Project = NonNullable<Awaited<ReturnType<typeof getProjectBySlug>>>;

export function ProjectDetailContent({ project }: { project: Project }) {
  const thumbnail =
    project.thumbnailImage?.publicUrl ?? project.images[0]?.media.publicUrl;

  return (
    <>
      <article className="container mx-auto max-w-4xl px-4 py-16">
        <FadeIn className="mb-8 flex flex-wrap gap-3">
          {project.liveUrl && (
            <Button asChild>
              <Link href={project.liveUrl} target="_blank" rel="noreferrer">
                Live demo
              </Link>
            </Button>
          )}
          {project.githubUrl && (
            <Button asChild variant="outline">
              <Link href={project.githubUrl} target="_blank" rel="noreferrer">
                GitHub
              </Link>
            </Button>
          )}
        </FadeIn>

        <FadeIn>
          <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {project.shortDescription}
          </p>
        </FadeIn>

        <FadeIn className="mt-6 flex flex-wrap gap-2" delay={0.05}>
          {project.technologies.map(({ technology }) => (
            <TechnologyBadge key={technology.id} technology={technology} />
          ))}
        </FadeIn>

        {project.githubRepository && (
          <FadeIn className="mt-4" delay={0.08}>
            <ProjectGithubStats repository={project.githubRepository} />
          </FadeIn>
        )}

        {thumbnail && (
          <FadeIn
            className="relative mt-10 aspect-video overflow-hidden rounded-xl border"
            delay={0.1}
          >
            <Image
              src={thumbnail}
              alt={project.title}
              fill
              className="object-cover"
            />
          </FadeIn>
        )}

        <FadeIn
          className="prose prose-neutral mt-10 max-w-none dark:prose-invert"
          delay={0.15}
        >
          <p className="whitespace-pre-wrap">{project.description}</p>
        </FadeIn>

        {project.images.length > 0 && (
          <StaggerContainer className="mt-12 grid gap-4">
            {project.images.map((image) => (
              <StaggerItem key={image.id}>
                <div className="relative aspect-video overflow-hidden rounded-xl border">
                  <Image
                    src={image.media.publicUrl}
                    alt={image.altText ?? project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </article>
      <ProjectViewTracker projectId={project.id} />
    </>
  );
}
