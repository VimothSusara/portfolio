import Link from "next/link";
import { GitBranch, GitPullRequest, MessageSquare, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OrganizationActivityRow = {
  organizationName: string;
  commits: number;
  pullRequests: number;
  reviews: number;
  issues: number;
  capturedAt: Date;
};

type OrganizationActivitySectionProps = {
  activities: OrganizationActivityRow[];
};

function totalActivity(activity: OrganizationActivityRow) {
  return (
    activity.commits +
    activity.pullRequests +
    activity.reviews +
    activity.issues
  );
}

export function OrganizationActivitySection({
  activities,
}: OrganizationActivitySectionProps) {
  if (activities.length === 0) return null;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Organization contributions
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your attributed activity within each organization over the last 365
          days.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {activities.map((activity) => (
          <Card key={activity.organizationName}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                <Link
                  href={`https://github.com/${activity.organizationName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {activity.organizationName}
                </Link>
              </CardTitle>
              <CardDescription>
                {totalActivity(activity).toLocaleString()} total contributions
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-muted-foreground" />
                <span>{activity.commits.toLocaleString()} commits</span>
              </div>
              <div className="flex items-center gap-2">
                <GitPullRequest className="size-4 text-muted-foreground" />
                <span>{activity.pullRequests.toLocaleString()} PRs</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <span>{activity.reviews.toLocaleString()} reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="size-4 text-muted-foreground" />
                <span>{activity.issues.toLocaleString()} issues</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
