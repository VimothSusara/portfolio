import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { SiteTrafficCharts } from "@/components/admin/site-traffic-charts";
import { TopPagesTable } from "@/components/admin/top-pages-table";
import { TopProjectsTable } from "@/components/admin/top-projects-table";
import { Button } from "@/components/ui/button";
import { getSiteAnalyticsSummary } from "@/lib/queries/site-analytics";

export const metadata: Metadata = {
  title: "Site traffic",
  robots: { index: false, follow: false },
};

export default async function AdminTrafficPage() {
  const analytics = await getSiteAnalyticsSummary(30);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site traffic</h1>
          <p className="text-muted-foreground">
            Page views, visitors, and project engagement over the last{" "}
            {analytics.days} days.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/admin/analytics">GitHub analytics →</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Page views"
          value={analytics.pageViews}
          description={`Last ${analytics.days} days`}
        />
        <StatCard
          title="New visitors"
          value={analytics.visitors}
          description="First visit in period"
        />
        <StatCard
          title="Project views"
          value={analytics.projectViews}
          description="Detail page opens"
        />
        <StatCard
          title="Resume downloads"
          value={analytics.resumeDownloads}
          description={`Last ${analytics.days} days`}
        />
      </div>

      <SiteTrafficCharts
        pageViewsDaily={analytics.pageViewsDaily}
        visitorsDaily={analytics.visitorsDaily}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <TopPagesTable pages={analytics.topPages} />
        <TopProjectsTable projects={analytics.topProjects} />
      </div>
    </div>
  );
}
