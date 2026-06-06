import { prisma } from "@/lib/prisma";

const PROFILE_ID = "default";

export async function getProfile() {
    return prisma.profile.findUnique({
        where: {
            id: PROFILE_ID,
        }
    })
}
