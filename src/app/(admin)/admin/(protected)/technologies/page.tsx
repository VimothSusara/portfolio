import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { TechnologiesTable } from "@/components/admin/technologies-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminTechnologies } from "@/lib/queries/admin-technologies";

export const metadata: Metadata = {
  title: "Technologies",
  robots: { index: false, follow: false },
};

export default async function AdminTechnologiesPage() {
  const technologies = await getAdminTechnologies();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Technologies</h1>
          <p className="text-muted-foreground">
            Manage stack icons and categories used on projects and your about
            page.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/technologies/new">
            <Plus className="size-4" />
            New technology
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All technologies</CardTitle>
          <CardDescription>
            Icons use Simple Icons slugs by default. Custom images override the
            slug when set.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TechnologiesTable technologies={technologies} />
        </CardContent>
      </Card>
    </div>
  );
}
