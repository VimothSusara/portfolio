"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FileText, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  fetchMediaLibrary,
  mediaToProjectInput,
  type MediaPickerItem,
} from "@/lib/media/client-upload";
import type { UploadFolder } from "@/lib/supabase/storage";
import type { ProjectMediaInput } from "@/validations/project";

type MediaPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder?: UploadFolder | "all";
  mimePrefix?: string;
  title?: string;
  description?: string;
  onSelect: (media: ProjectMediaInput) => void;
};

export function MediaPickerDialog({
  open,
  onOpenChange,
  folder = "all",
  mimePrefix,
  title = "Choose media",
  description = "Select an existing upload from your media library.",
  onSelect,
}: MediaPickerDialogProps) {
  const [items, setItems] = useState<MediaPickerItem[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function loadMedia() {
      setIsLoading(true);
      try {
        const media = await fetchMediaLibrary({
          folder,
          mimePrefix,
          search: search.trim() || undefined,
        });
        setItems(media);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load media",
        );
      } finally {
        setIsLoading(false);
      }
    }

    const timeout = setTimeout(loadMedia, search ? 250 : 0);
    return () => clearTimeout(timeout);
  }, [open, folder, mimePrefix, search]);

  function handleSelect(item: MediaPickerItem) {
    onSelect(mediaToProjectInput(item));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by filename or path..."
            className="pl-9"
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No media found. Upload a file first.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="overflow-hidden rounded-lg border text-left transition-colors hover:border-foreground/20 hover:bg-muted/40"
                >
                  <div className="relative aspect-video bg-muted">
                    {item.mimeType.startsWith("image/") ? (
                      <Image
                        src={item.publicUrl}
                        alt={item.filename}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <FileText className="size-10" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <p className="truncate text-sm font-medium">{item.filename}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.inUse ? (
                        <Badge variant="secondary">In use</Badge>
                      ) : (
                        <Badge variant="outline">Orphan</Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
