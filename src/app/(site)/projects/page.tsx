import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/fade-in";
import { AnimatedProjectGrid } from "@/components/site/animated-project-grid";
import { getPublishedProjects } from "@/lib/queries/projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "A collection of projects, experiments, and production work.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <section className="container mx-auto px-4 py-16">
      <FadeIn className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="mt-2 text-muted-foreground">
          Collection of projects, experiments, and production work.
        </p>
      </FadeIn>

      <AnimatedProjectGrid
        projects={projects}
        emptyTitle="No published projects"
        emptyDescription="Projects with PUBLISHED status will show up here automatically."
      />
    </section>
  );
}