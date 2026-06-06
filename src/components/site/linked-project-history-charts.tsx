import type { RepositoryHistorySeries } from "@/lib/queries/github-analytics";
import { GithubRepositoryHistoryCharts } from "@/components/site/github-repository-history-charts";

type LinkedProjectHistory = {
  projectId: string;
  projectTitle: string;
  repositoryId: string;
  ownerName: string;
  repoName: string;
  points: RepositoryHistorySeries["points"];
};

export function LinkedProjectHistoryCharts({
  histories,
}: {
  histories: LinkedProjectHistory[];
}) {
  const series: RepositoryHistorySeries[] = histories.map((history) => ({
    repositoryId: history.repositoryId,
    ownerName: history.ownerName,
    repoName: history.repoName,
    points: history.points,
  }));

  return (
    <GithubRepositoryHistoryCharts
      series={series}
      title="Linked project repositories"
      description="Trends for portfolio projects connected to synced GitHub repositories."
    />
  );
}
