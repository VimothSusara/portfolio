import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getAdminUser() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findFirst({
    where: {
      id: session.userId,
      role: "ADMIN",
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
    },
  });
}

export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}