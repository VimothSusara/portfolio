import type { Prisma } from "@/generated/prisma/client";

export async function applyProjectGithubRepositoryLink(
  tx: Prisma.TransactionClient,
  projectId: string,
  githubRepositoryId: string | null,
  previousRepositoryId?: string | null,
) {
  if (
    previousRepositoryId &&
    previousRepositoryId !== githubRepositoryId
  ) {
    await tx.githubSnapshot.updateMany({
      where: {
        repositoryId: previousRepositoryId,
        projectId,
      },
      data: { projectId: null },
    });
  }

  if (!githubRepositoryId) return;

  await tx.project.updateMany({
    where: {
      githubRepositoryId,
      NOT: { id: projectId },
    },
    data: { githubRepositoryId: null },
  });

  await tx.githubSnapshot.updateMany({
    where: { repositoryId: githubRepositoryId },
    data: { projectId },
  });
}
