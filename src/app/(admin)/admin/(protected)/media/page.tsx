import type { Metadata } from "next";
import { MediaLibrary } from "@/components/admin/media-library";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminMediaStats, listAdminMedia } from "@/lib/queries/admin-media";

export const metadata: Metadata = {
  title: "Media",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  const [media, stats] = await Promise.all([
    listAdminMedia({ limit: 200 }),
    getAdminMediaStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Media library</h1>
        <p className="text-muted-foreground">
          Browse uploaded files, reuse existing media, and clean up orphaned
          Supabase objects.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stored files</CardTitle>
          <CardDescription>
            Orphans are safe to delete. Files marked in use are referenced by
            your profile, projects, or blog content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MediaLibrary initialMedia={media} stats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}
