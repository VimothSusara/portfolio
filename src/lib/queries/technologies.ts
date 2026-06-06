import { prisma } from "@/lib/prisma";

export async function getTechnologies() {
  return prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      projects: {
        where: { project: { status: "PUBLISHED" } },
        include: { project: true },
      },
    },
  });
}