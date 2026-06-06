"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/github-icon";
import { LinkedInIcon } from "@/components/icons/linkedin-icon";
import { Mail } from "lucide-react";
import type { Profile } from "@/generated/prisma/client";

export function AboutContent({ profile }: { profile: Profile | null }) {
  if (!profile) {
    return (
      <section className="container mx-auto px-4 py-16">
        <p className="text-muted-foreground">
          Profile information is not available yet.
        </p>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-4xl px-4 py-16">
      <FadeIn className="flex flex-col gap-8 md:flex-row md:items-start">
        {profile.avatarUrl && (
          <div className="relative size-32 shrink-0 overflow-hidden rounded-full border md:size-40">
            <Image
              src={profile.avatarUrl}
              alt={profile.fullName}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            {profile.location ?? "Software Engineer"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {profile.fullName}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">{profile.title}</p>
          <p className="mt-4 text-muted-foreground">{profile.shortBio}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {profile.resumeUrl && (
              <Button asChild>
                <Link
                  href="/api/resume"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download resume
                </Link>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href="/contact">Contact me</Link>
            </Button>
          </div>
        </div>
      </FadeIn>

      <FadeIn
        className="prose prose-neutral mt-12 max-w-none dark:prose-invert"
        delay={0.1}
      >
        <h2>About me</h2>
        <p className="whitespace-pre-wrap">{profile.longBio}</p>
      </FadeIn>

      <FadeIn className="mt-10 flex flex-wrap items-center gap-4" delay={0.15}>
        {profile.githubUrl && (
          <Link
            href={profile.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-4" />
            GitHub
          </Link>
        )}
        {profile.linkedinUrl && (
          <Link
            href={profile.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LinkedInIcon className="size-4" />
            LinkedIn
          </Link>
        )}
        <Link
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Mail className="size-4" />
          {profile.email}
        </Link>
      </FadeIn>
    </section>
  );
}
