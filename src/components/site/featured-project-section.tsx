"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { AnimatedProjectGrid } from "@/components/site/animated-project-grid";
import { EmptyState } from "@/components/shared/empty-state";
import type { getFeaturedProjects } from "@/lib/queries/projects";

type Project = Awaited<ReturnType<typeof getFeaturedProjects>>[number];

export function FeaturedProjectsSection({
  projects,
}: {
  projects: Project[];
}) {
  return (
    <section className="container mx-auto px-4 pb-20">
      <FadeIn className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Featured projects</h2>
          <p className="text-muted-foreground">Selected work and case studies.</p>
        </div>
        {projects.length > 0 && (
          <Button asChild variant="ghost">
            <Link href="/projects">View all</Link>
          </Button>
        )}
      </FadeIn>

      {projects.length === 0 ? (
        <EmptyState
          title="No featured projects yet"
          description="Published projects marked as featured will appear here."
          actionLabel="View all projects"
          actionHref="/projects"
        />
      ) : (
        <AnimatedProjectGrid projects={projects} />
      )}
    </section>
  );
}