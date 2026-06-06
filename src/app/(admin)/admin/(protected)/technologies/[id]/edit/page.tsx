import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TechnologyForm } from "@/components/admin/technology-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminTechnologyById } from "@/lib/queries/admin-technologies";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const technology = await getAdminTechnologyById(id);
  return {
    title: technology ? `Edit ${technology.name}` : "Edit technology",
  };
}

export default async function AdminEditTechnologyPage({ params }: Props) {
  const { id } = await params;
  const technology = await getAdminTechnologyById(id);

  if (!technology) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit technology</h1>
        <p className="text-muted-foreground">{technology.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technology details</CardTitle>
        </CardHeader>
        <CardContent>
          <TechnologyForm
            mode="edit"
            technologyId={technology.id}
            defaultValues={{
              name: technology.name,
              slug: technology.slug,
              category: technology.category ?? "",
              iconName: technology.iconName ?? "",
              iconUrl: technology.iconUrl ?? "",
              websiteUrl: technology.websiteUrl ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
