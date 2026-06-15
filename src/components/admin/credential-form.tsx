"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  credentialFormSchema,
  type CredentialFormValues,
} from "@/validations/credential";

type CredentialFormProps = {
  mode: "create" | "edit";
  credentialId?: string;
  defaultValues?: Partial<CredentialFormValues>;
  imagePreviewUrl?: string;
  readOnly?: boolean;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function CredentialForm({
  mode,
  credentialId,
  defaultValues,
  imagePreviewUrl = "",
  readOnly = false,
}: CredentialFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(imagePreviewUrl);

  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: {
      title: "",
      issuer: "",
      description: "",
      type: "CERTIFICATION",
      credentialUrl: "",
      iconUrl: "",
      imageId: "",
      issuedAt: "",
      expiresAt: "",
      sortOrder: 0,
      featured: false,
      published: true,
      ...defaultValues,
    },
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form;

  const type = watch("type");
  const featured = watch("featured");
  const published = watch("published");

  async function onSubmit(values: CredentialFormValues) {
    setIsSaving(true);

    try {
      const url =
        mode === "create"
          ? "/api/admin/credentials"
          : `/api/admin/credentials/${credentialId}`;

      const response = await fetch(url, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save credential");
      }

      toast.success(mode === "create" ? "Credential created" : "Credential updated");
      router.push("/admin/credentials");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save credential");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {readOnly && (
        <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
          This credential was synced from an external platform and cannot be edited
          manually.
        </p>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            disabled={readOnly}
            {...register("title")}
            placeholder="AWS Solutions Architect Associate"
          />
          <FieldError message={errors.title?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuer">Issuer</Label>
          <Input
            id="issuer"
            disabled={readOnly}
            {...register("issuer")}
            placeholder="Amazon Web Services"
          />
          <FieldError message={errors.issuer?.message} />
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={type}
            disabled={readOnly}
            onValueChange={(value) =>
              setValue("type", value as CredentialFormValues["type"], {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CERTIFICATION">Certification</SelectItem>
              <SelectItem value="BADGE">Badge</SelectItem>
              <SelectItem value="AWARD">Award</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.type?.message} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            disabled={readOnly}
            rows={3}
            {...register("description")}
            placeholder="Optional short description"
          />
          <FieldError message={errors.description?.message} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="issuedAt">Issued date</Label>
          <Input
            id="issuedAt"
            type="date"
            disabled={readOnly}
            defaultValue={defaultValues?.issuedAt ?? ""}
            onChange={(event) =>
              setValue("issuedAt", event.target.value, { shouldDirty: true })
            }
          />
          <FieldError message={errors.issuedAt?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expiry date</Label>
          <Input
            id="expiresAt"
            type="date"
            disabled={readOnly}
            defaultValue={defaultValues?.expiresAt ?? ""}
            onChange={(event) =>
              setValue("expiresAt", event.target.value, { shouldDirty: true })
            }
          />
          <FieldError message={errors.expiresAt?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="credentialUrl">Credential URL</Label>
          <Input
            id="credentialUrl"
            disabled={readOnly}
            {...register("credentialUrl")}
            placeholder="https://credly.com/badges/..."
          />
          <FieldError message={errors.credentialUrl?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            disabled={readOnly}
            {...register("sortOrder", { valueAsNumber: true })}
          />
          <FieldError message={errors.sortOrder?.message} />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ImageUploadField
          label="Badge image"
          folder="credentials"
          value={imageUrl || watch("iconUrl") || ""}
          onChange={(url) => {
            setImageUrl(url);
            if (!url) {
              setValue("iconUrl", "", { shouldDirty: true });
              setValue("imageId", "", { shouldDirty: true });
              return;
            }
            setValue("iconUrl", url, { shouldDirty: true });
          }}
          onUploadComplete={(media) => {
            setImageUrl(media.publicUrl);
            setValue("iconUrl", media.publicUrl, { shouldDirty: true });
            const mediaWithId = media as { id?: string };
            if (mediaWithId.id) {
              setValue("imageId", mediaWithId.id, { shouldDirty: true });
            }
          }}
        />

        <div className="space-y-2">
          <Label htmlFor="iconUrl">Image URL override</Label>
          <Input
            id="iconUrl"
            disabled={readOnly}
            {...register("iconUrl")}
            placeholder="Or paste an image URL"
          />
          <FieldError message={errors.iconUrl?.message} />
          <p className="text-xs text-muted-foreground">
            Upload a badge or paste a direct image URL. Uploaded images are linked via
            the media library.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={featured}
            disabled={readOnly}
            onCheckedChange={(checked) =>
              setValue("featured", checked === true, { shouldDirty: true })
            }
          />
          Featured
        </label>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={published}
            disabled={readOnly}
            onCheckedChange={(checked) =>
              setValue("published", checked === true, { shouldDirty: true })
            }
          />
          Published on about page
        </label>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving || readOnly}>
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Create credential" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
