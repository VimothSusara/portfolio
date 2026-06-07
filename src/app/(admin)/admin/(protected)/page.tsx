import type { Metadata } from "next";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminDashboardStats } from "@/lib/queries/admin-stats";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your portfolio content and activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total projects"
          value={stats.totalProjects}
          description={`${stats.publishedProjects} published`}
        />
        <StatCard
          title="Pending messages"
          value={stats.pendingMessages}
          description="Awaiting review"
        />
        <StatCard
          title="Resume downloads"
          value={stats.resumeDownloads}
          description="Tracked downloads"
        />
        <StatCard
          title="Technologies"
          value={stats.technologies}
          description="In your stack"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Page views (7d)"
          value={stats.pageViews}
          description="Public site traffic"
        />
        <StatCard
          title="Visitors (7d)"
          value={stats.visitors}
          description="New visitor records"
        />
        <StatCard
          title="Project views (7d)"
          value={stats.projectViews}
          description="Project detail pages"
        />
        <StatCard
          title="Resume downloads"
          value={stats.resumeDownloads}
          description="All time"
        />
      </div>

      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/traffic">View traffic analytics →</Link>
        </Button>
      </div>
    </div>
  );
}
