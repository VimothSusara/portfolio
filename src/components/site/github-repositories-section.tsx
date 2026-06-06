import Link from "next/link";
import { Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type GithubRepositoryRow = {
  ownerName: string;
  repoName: string;
  stars: number;
  forks: number;
  openIssues: number;
  updatedAt: Date;
};

type GithubRepositoriesSectionProps = {
  title: string;
  description: string;
  repositories: GithubRepositoryRow[];
};

export function GithubRepositoriesSection({
  title,
  description,
  repositories,
}: GithubRepositoriesSectionProps) {
  if (repositories.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {repositories.map((repo) => (
          <Card key={`${repo.ownerName}/${repo.repoName}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium">
                <Link
                  href={`https://github.com/${repo.ownerName}/${repo.repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {repo.ownerName}/{repo.repoName}
                </Link>
              </CardTitle>
              <CardDescription>
                Updated {new Date(repo.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="size-4" />
                {repo.stars.toLocaleString()} stars
              </span>
              <span>{repo.forks.toLocaleString()} forks</span>
              <span>{repo.openIssues.toLocaleString()} open issues</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
