"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ProjectMediaInput } from "@/validations/project";

type ProjectGalleryFieldProps = {
  value: ProjectMediaInput[];
  onChange: (items: ProjectMediaInput[]) => void;
};

export function ProjectGalleryField({ value, onChange }: ProjectGalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) return;

    setIsUploading(true);

    try {
      const uploaded: ProjectMediaInput[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is over 5MB`);
          continue;
        }

        const presignResponse = await fetch("/api/admin/media/upload-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-file-size": String(file.size),
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            folder: "projects",
          }),
        });

        const presignData = await presignResponse.json();
        if (!presignResponse.ok) {
          throw new Error(presignData.error ?? "Failed to get upload URL");
        }

        const uploadResponse = await fetch(presignData.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        uploaded.push({
          publicUrl: presignData.publicUrl,
          storagePath: presignData.path,
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
        });
      }

      if (uploaded.length > 0) {
        onChange([...value, ...uploaded]);
        toast.success(`${uploaded.length} image(s) added`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <Label>Gallery images</Label>

      {value.length === 0 ? (
        <div className="flex h-24 max-w-sm items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          No gallery images
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {value.map((item, index) => (
            <div
              key={`${item.publicUrl}-${index}`}
              className="relative aspect-video overflow-hidden rounded-lg border"
            >
              <Image
                src={item.publicUrl}
                alt={item.filename ?? `Gallery image ${index + 1}`}
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeAt(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Upload className="size-4" />
        )}
        Add gallery images
      </Button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}
