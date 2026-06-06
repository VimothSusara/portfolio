import type { Metadata } from "next";
import { TechnologyForm } from "@/components/admin/technology-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "New technology",
  robots: { index: false, follow: false },
};

export default function AdminNewTechnologyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New technology</h1>
        <p className="text-muted-foreground">
          Add a technology to your stack and project picker.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technology details</CardTitle>
        </CardHeader>
        <CardContent>
          <TechnologyForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
