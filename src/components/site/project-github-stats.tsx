import { GitFork, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProjectGithubRepositoryStats = {
  ownerName: string;
  repoName: string;
  stars: number;
  forks: number;
  openIssues: number;
};

type ProjectGithubStatsProps = {
  repository: ProjectGithubRepositoryStats;
  className?: string;
  compact?: boolean;
};

export function ProjectGithubStats({
  repository,
  className,
  compact = false,
}: ProjectGithubStatsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground",
        compact ? "text-xs" : "text-sm",
        className,
      )}
    >
      <span className="font-medium text-foreground/80">
        {repository.ownerName}/{repository.repoName}
      </span>
      <span className="inline-flex items-center gap-1">
        <Star className={compact ? "size-3" : "size-3.5"} />
        {repository.stars.toLocaleString()}
      </span>
      <span className="inline-flex items-center gap-1">
        <GitFork className={compact ? "size-3" : "size-3.5"} />
        {repository.forks.toLocaleString()}
      </span>
      {!compact && (
        <span>{repository.openIssues.toLocaleString()} open issues</span>
      )}
    </div>
  );
}
