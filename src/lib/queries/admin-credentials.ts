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

export async function getAdminCredentials() {
  return prisma.credential.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
    include: credentialInclude,
  });
}

export async function getAdminCredentialById(id: string) {
  return prisma.credential.findUnique({
    where: { id },
    include: credentialInclude,
  });
}
