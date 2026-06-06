import type { Metadata } from "next";
import { AboutContent } from "@/components/site/about-content";
import { getProfile } from "@/lib/queries/profile";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about my background, experience, and what I build.",
};

export default async function AboutPage() {
  const profile = await getProfile();
  return <AboutContent profile={profile} />;
}