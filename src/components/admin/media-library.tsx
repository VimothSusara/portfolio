"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminMediaItem } from "@/lib/queries/admin-media";

type MediaLibraryProps = {
  initialMedia: AdminMediaItem[];
  stats: {
    total: number;
    inUse: number;
    orphans: number;
  };
};

export function MediaLibrary({ initialMedia, stats }: MediaLibraryProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState<string>("all");
  const [orphanOnly, setOrphanOnly] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredMedia = useMemo(() => {
    return initialMedia.filter((item) => {
      if (folder !== "all" && item.folder !== folder) return false;
      if (orphanOnly && item.inUse) return false;
      if (!search.trim()) return true;

      const query = search.trim().toLowerCase();
      return (
        item.filename.toLowerCase().includes(query) ||
        item.storagePath.toLowerCase().includes(query)
      );
    });
  }, [folder, initialMedia, orphanOnly, search]);

  async function handleDelete(media: AdminMediaItem) {
    if (media.inUse) {
      toast.error("This file is still in use and cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${media.filename}" from Supabase and the media library?`,
    );
    if (!confirmed) return;

    setDeletingId(media.id);

    try {
      const response = await fetch(`/api/admin/media/${media.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete media");
      }

      toast.success("Media deleted");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete media");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total files</p>
          <p className="text-2xl font-semibold tabular-nums">{stats.total}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">In use</p>
          <p className="text-2xl font-semibold tabular-nums">{stats.inUse}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Orphans</p>
          <p className="text-2xl font-semibold tabular-nums">{stats.orphans}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search media..."
            className="pl-9"
          />
        </div>

        <Select value={folder} onValueChange={setFolder}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All folders</SelectItem>
            <SelectItem value="profile">Profile</SelectItem>
            <SelectItem value="projects">Projects</SelectItem>
            <SelectItem value="resumes">Resumes</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant={orphanOnly ? "default" : "outline"}
          onClick={() => setOrphanOnly((current) => !current)}
        >
          {orphanOnly ? "Showing orphans" : "Show orphans only"}
        </Button>
      </div>

      {filteredMedia.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No media matches your filters.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredMedia.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border">
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

              <div className="space-y-3 p-4">
                <div>
                  <p className="truncate font-medium">{item.filename}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.storagePath}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{item.folder}</Badge>
                  {item.inUse ? (
                    <Badge variant="secondary">In use</Badge>
                  ) : (
                    <Badge variant="destructive">Orphan</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={item.publicUrl} target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={item.inUse || deletingId === item.id}
                    onClick={() => handleDelete(item)}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
