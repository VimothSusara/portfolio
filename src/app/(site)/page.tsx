import { HeroSection } from "@/components/site/hero-section";
import { FeaturedProjectsSection } from "@/components/site/featured-project-section";
import { TechStack } from "@/components/site/tech-stack";
import { getFeaturedProjects } from "@/lib/queries/projects";
import { getProfile } from "@/lib/queries/profile";
import { getTechnologies } from "@/lib/queries/technologies";

export const revalidate = 60;

export default async function HomePage() {
  const [profile, featuredProjects, technologies] = await Promise.all([
    getProfile(),
    getFeaturedProjects(3),
    getTechnologies(),
  ]);

  return (
    <>
      <HeroSection profile={profile} />
      <FeaturedProjectsSection projects={featuredProjects} />
      <TechStack technologies={technologies} />
    </>
  );
}