import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CredentialForm } from "@/components/admin/credential-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminCredentialById } from "@/lib/queries/admin-credentials";
import { getCredentialImageUrl } from "@/lib/credentials/display";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const credential = await getAdminCredentialById(id);
  return {
    title: credential ? `Edit ${credential.title}` : "Edit credential",
  };
}

function toDateInputValue(date: Date | null | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default async function AdminEditCredentialPage({ params }: Props) {
  const { id } = await params;
  const credential = await getAdminCredentialById(id);

  if (!credential) notFound();

  const readOnly = credential.source !== "MANUAL";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit credential</h1>
        <p className="text-muted-foreground">{credential.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Credential details</CardTitle>
        </CardHeader>
        <CardContent>
          <CredentialForm
            mode="edit"
            credentialId={credential.id}
            readOnly={readOnly}
            imagePreviewUrl={getCredentialImageUrl(credential) ?? ""}
            defaultValues={{
              title: credential.title,
              issuer: credential.issuer ?? "",
              description: credential.description ?? "",
              type: credential.type,
              credentialUrl: credential.credentialUrl ?? "",
              iconUrl: credential.iconUrl ?? "",
              imageId: credential.imageId ?? "",
              issuedAt: toDateInputValue(credential.issuedAt),
              expiresAt: toDateInputValue(credential.expiresAt),
              sortOrder: credential.sortOrder,
              featured: credential.featured,
              published: credential.published,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
