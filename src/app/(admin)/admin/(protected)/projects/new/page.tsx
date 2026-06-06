import type { Metadata } from "next";
import { ProjectForm } from "@/components/admin/project-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminTechnologies } from "@/lib/queries/admin-projects";

export const metadata: Metadata = {
  title: "New project",
  robots: { index: false, follow: false },
};

export default async function AdminNewProjectPage() {
  const technologies = await getAdminTechnologies();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New project</h1>
        <p className="text-muted-foreground">Add a new portfolio project.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm mode="create" technologies={technologies} />
        </CardContent>
      </Card>
    </div>
  );
}