import type { Metadata } from "next";
import { AboutContent } from "@/components/site/about-content";
import { PlatformStatsSection } from "@/components/site/platform-stats-section";
import { getPublishedCredentials } from "@/lib/queries/credentials";
import { getProfile } from "@/lib/queries/profile";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about my background, experience, and what I build.",
};

export default async function AboutPage() {
  const [profile, credentials] = await Promise.all([
    getProfile(),
    getPublishedCredentials(),
  ]);

  return <AboutContent profile={profile} credentials={credentials} platformStats={<PlatformStatsSection />} />;
}