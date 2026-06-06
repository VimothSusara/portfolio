import { prisma } from "@/lib/prisma";

const technologyInclude = {
  _count: {
    select: { projects: true },
  },
};

export async function getAdminTechnologies() {
  return prisma.technology.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: technologyInclude,
  });
}

export async function getAdminTechnologyById(id: string) {
  return prisma.technology.findUnique({
    where: { id },
    include: technologyInclude,
  });
}
