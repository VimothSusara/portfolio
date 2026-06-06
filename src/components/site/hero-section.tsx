"use client";

import Image from "next/image";
import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { heroContainer, heroItem } from "@/lib/motion/variants";
import type { Profile } from "@/generated/prisma/client";

const DEFAULT_HERO_IMAGE = "/images/hero-section-bg-image.jpeg";

export function HeroSection({ profile }: { profile: Profile | null }) {
  const shouldReduceMotion = useReducedMotion();
  const heroImage = profile?.heroImageUrl ?? DEFAULT_HERO_IMAGE;

  const content = (
    <>
      <p className="text-sm font-medium text-muted-foreground">
        {profile?.location ?? "Available for work"}
      </p>

      <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
        {profile?.title ?? "Full-Stack Developer"}
      </h1>

      <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
        {profile?.shortBio ??
          "I build scalable, data-driven web applications with modern TypeScript stacks."}
      </p>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/projects">View projects</Link>
        </Button>
        {profile?.resumeUrl && (
          <Button asChild variant="outline">
            <Link href="/api/resume" target="_blank" rel="noopener noreferrer">
              Download resume
            </Link>
          </Button>
        )}
      </div>
    </>
  );

  const layoutClassName = "flex max-w-3xl flex-col gap-6 md:gap-8";

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-background/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-24 md:px-6 md:py-32">
        {shouldReduceMotion ? (
          <div className={layoutClassName}>{content}</div>
        ) : (
          <m.div
            initial="hidden"
            animate="visible"
            variants={heroContainer}
            className={layoutClassName}
          >
            <m.p
              variants={heroItem}
              className="text-sm font-medium text-muted-foreground"
            >
              {profile?.location ?? "Available for work"}
            </m.p>

            <m.h1
              variants={heroItem}
              className="text-4xl font-bold tracking-tight md:text-6xl"
            >
              {profile?.title ?? "Full-Stack Developer"}
            </m.h1>

            <m.p
              variants={heroItem}
              className="max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              {profile?.shortBio ??
                "I build scalable, data-driven web applications with modern TypeScript stacks."}
            </m.p>

            <m.div variants={heroItem} className="flex flex-wrap gap-3 pt-2">
              <Button asChild>
                <Link href="/projects">View projects</Link>
              </Button>
              {profile?.resumeUrl && (
                <Button asChild variant="outline">
                  <Link
                    href="/api/resume"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download resume
                  </Link>
                </Button>
              )}
            </m.div>
          </m.div>
        )}
      </div>
    </section>
  );
}
