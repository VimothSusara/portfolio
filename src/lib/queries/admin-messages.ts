import { prisma } from "@/lib/prisma";

export async function getAdminMessages() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminMessageById(id: string) {
  return prisma.contactMessage.findUnique({ where: { id } });
}