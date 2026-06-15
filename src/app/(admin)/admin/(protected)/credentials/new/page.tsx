import type { Metadata } from "next";
import { CredentialForm } from "@/components/admin/credential-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "New credential",
  robots: { index: false, follow: false },
};

export default function AdminNewCredentialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New credential</h1>
        <p className="text-muted-foreground">
          Add a certification, badge, or award to your about page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credential details</CardTitle>
        </CardHeader>
        <CardContent>
          <CredentialForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
