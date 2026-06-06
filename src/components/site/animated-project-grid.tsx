"use client";

import { ProjectCard } from "@/components/site/project-card";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import { EmptyState } from "@/components/shared/empty-state";
import type { getPublishedProjects } from "@/lib/queries/projects";
import { cn } from "@/lib/utils";

type Project = Awaited<ReturnType<typeof getPublishedProjects>>[number];

type AnimatedProjectGridProps = {
  projects: Project[];
  className?: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function AnimatedProjectGrid({
  projects,
  className,
  emptyTitle = "No projects published yet",
  emptyDescription = "Check back soon — new work is on the way.",
}: AnimatedProjectGridProps) {
  if (projects.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <StaggerContainer
      className={cn("grid gap-6 md:grid-cols-2 lg:grid-cols-3", className)}
    >
      {projects.map((project) => (
        <StaggerItem key={project.id}>
          <ProjectCard project={project} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}