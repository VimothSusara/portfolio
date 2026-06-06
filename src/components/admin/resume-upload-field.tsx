"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_RESUME_SIZE = 10 * 1024 * 1024;

type ResumeUploadFieldProps = {
  value?: string;
  onChange: (url: string) => void;
};

export function ResumeUploadField({ value, onChange }: ResumeUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      toast.error("Resume must be under 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const presignResponse = await fetch("/api/admin/media/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-file-size": String(file.size),
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "resumes",
        }),
      });

      const presignData = await presignResponse.json();
      if (!presignResponse.ok) {
        throw new Error(presignData.error ?? "Failed to get upload URL");
      }

      const uploadResponse = await fetch(presignData.signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      onChange(presignData.publicUrl);
      toast.success("Resume uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <Label>Resume</Label>

      {value ? (
        <div className="flex max-w-sm items-center gap-3 rounded-lg border p-4">
          <FileText className="size-8 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Resume uploaded</p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-muted-foreground hover:underline"
            >
              View PDF
            </a>
          </div>
        </div>
      ) : (
        <div className="flex h-24 max-w-sm items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          No resume uploaded
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
          Upload PDF
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
        placeholder="Or paste a resume URL"
      />

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}