import { prisma } from "@/lib/prisma";

const credentialInclude = {
  image: {
    select: {
      id: true,
      publicUrl: true,
      filename: true,
    },
  },
};

export async function getPublishedCredentials() {
  return prisma.credential.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { issuedAt: "desc" }, { title: "asc" }],
    include: credentialInclude,
  });
}

export async function getPublishedCredentialsByType(
  type: "CERTIFICATION" | "BADGE" | "AWARD",
) {
  return prisma.credential.findMany({
    where: { published: true, type },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { issuedAt: "desc" }],
    include: credentialInclude,
  });
}
