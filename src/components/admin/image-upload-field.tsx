"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FolderOpen, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { MediaPickerDialog } from "@/components/admin/media-picker-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadAndRegisterMedia } from "@/lib/media/client-upload";
import type { UploadFolder } from "@/lib/supabase/storage";
import type { ProjectMediaInput } from "@/validations/project";

type ImageUploadFieldProps = {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onUploadComplete?: (media: ProjectMediaInput) => void;
  folder?: Extract<UploadFolder, "profile" | "projects" | "credentials">;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  onUploadComplete,
  folder = "profile",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const media = await uploadAndRegisterMedia({ file, folder });
      onChange(media.publicUrl);
      onUploadComplete?.(media);
      toast.success(`${label} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleLibrarySelect(media: ProjectMediaInput) {
    onChange(media.publicUrl);
    onUploadComplete?.(media);
    toast.success(`${label} selected from library`);
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {value ? (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
          <Image src={value} alt={label} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-32 max-w-sm items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          No image selected
        </div>
      )}

      <div className="flex flex-wrap gap-2">
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
          Upload image
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPickerOpen(true)}
        >
          <FolderOpen className="size-4" />
          Choose existing
        </Button>

        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Remove
          </Button>
        )}
      </div>

      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Or paste an image URL"
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        folder={folder}
        mimePrefix="image/"
        title={`Choose ${label.toLowerCase()}`}
        onSelect={handleLibrarySelect}
      />
    </div>
  );
}
