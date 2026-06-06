"use client";

import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/motion/stagger";
import type { getTechnologies } from "@/lib/queries/technologies";

type Technology = Awaited<ReturnType<typeof getTechnologies>>[number];

export function TechStack({ technologies }: { technologies: Technology[] }) {
  const grouped = technologies.reduce<Record<string, Technology[]>>((acc, tech) => {
    const key = tech.category ?? "Other";
    acc[key] = acc[key] ? [...acc[key], tech] : [tech];
    return acc;
  }, {});

  return (
    <section className="container mx-auto px-4 pb-20">
      <FadeIn>
        <h2 className="text-2xl font-semibold">Tech stack</h2>
        <p className="mt-2 text-muted-foreground">
          Tools and technologies I work with.
        </p>
      </FadeIn>

      <StaggerContainer className="mt-8 grid gap-6 md:grid-cols-2">
        {Object.entries(grouped).map(([category, items]) => (
          <StaggerItem key={category}>
            <div className="rounded-xl border p-5 transition-shadow hover:shadow-sm">
              <h3 className="mb-3 font-medium">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map((tech) => (
                  <Badge key={tech.id} variant="outline">
                    {tech.name}
                  </Badge>
                ))}
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}