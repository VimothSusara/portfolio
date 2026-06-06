import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import slugify from "slugify";
import { hashPassword } from "../src/lib/auth/password";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await hashPassword(adminPassword);
  await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      password: passwordHash,
      role: "ADMIN",
    },
    create: {
      username: adminUsername,
      email: "admin@portfolio.local",
      password: passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin user ready: ${adminUsername}`);

  // Singleton profile
  await prisma.profile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      fullName: "Vimoth Susara",
      title: "Full-Stack Developer",
      shortBio: "I build scalable, data-driven web applications.",
      longBio:
        "I'm a full-stack developer specializing in Next.js, TypeScript, PostgreSQL, and developer tooling. I focus on clean architecture, performance, and products that feel alive — not static brochure sites.",
      email: "vimothsusara@gmail.com",
      location: "Colombo, Sri Lanka",
      githubUrl: "https://github.com/vimothsusara",
      linkedinUrl: "https://linkedin.com/in/vimothsusara",
      websiteUrl: "https://vimothsusara.com",
      heroImageUrl: "/images/hero-section-bg-image.jpeg",
      // resumeUrl: "https://vimothsusara.com/resume.pdf",
    },
  });

  const technologies = await Promise.all(
    [
      { name: "Next.js", category: "Framework", iconName: "nextdotjs" },
      { name: "TypeScript", category: "Language", iconName: "typescript" },
      { name: "PostgreSQL", category: "Database", iconName: "postgresql" },
      { name: "Prisma", category: "ORM", iconName: "prisma" },
      { name: "Tailwind CSS", category: "Styling", iconName: "tailwindcss" },
    ].map((tech) =>
      prisma.technology.upsert({
        where: { slug: slugify(tech.name, { lower: true, strict: true }) },
        update: {
          category: tech.category,
          iconName: tech.iconName,
        },
        create: {
          name: tech.name,
          slug: slugify(tech.name, { lower: true, strict: true }),
          category: tech.category,
          iconName: tech.iconName,
        },
      }),
    ),
  );

  const nextjs = technologies.find((t) => t.slug === "nextjs")!;
  const typescript = technologies.find((t) => t.slug === "typescript")!;
  const postgres = technologies.find((t) => t.slug === "postgresql")!;

  await prisma.project.upsert({
    where: { slug: "vimoth-susara-portfolio" },
    update: {},
    create: {
      title: "Vimoth Susara's Portfolio",
      slug: "vimoth-susara-portfolio",
      shortDescription:
        "A production-grade portfolio with CMS, GitHub analytics, and contact handling.",
      description:
        "A modern full-stack developer portfolio built with Next.js, Prisma, and PostgreSQL. Features a data-driven public site, admin CMS, Supabase media storage, GitHub sync jobs, and developer analytics.",
      githubUrl: "https://github.com/vimothsusara/portfolio",
      liveUrl: "https://vimothsusara.com",
      featured: true,
      status: "PUBLISHED",
      lifecycle: "IN_PROGRESS",
      type: "APPLICATION",
      publishedAt: new Date(),
      sortOrder: 0,
      technologies: {
        create: [
          { technologyId: nextjs.id },
          { technologyId: typescript.id },
          { technologyId: postgres.id },
        ],
      },
    },
  });

  // Optional: seed a GitHub repo + snapshot for analytics testing
  const repo = await prisma.githubRepository.upsert({
    where: {
      ownerName_repoName: {
        ownerName: "vimothsusara",
        repoName: "vimoth-susara-portfolio",
      },
    },
    update: {},
    create: {
      ownerName: "vimothsusara",
      repoName: "vimoth-susara-portfolio",
      stars: 12,
      forks: 3,
      watchers: 12,
      openIssues: 1,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date(),
    },
  });

  const project = await prisma.project.findUnique({
    where: { slug: "vimoth-susara-portfolio" },
  });

  await prisma.githubSnapshot.create({
    data: {
      repositoryId: repo.id,
      projectId: project?.id,
      stars: 12,
      forks: 3,
      commits: 148,
      openIssues: 1,
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
