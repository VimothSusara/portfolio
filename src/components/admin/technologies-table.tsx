"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TechnologyIcon } from "@/components/site/technology-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TechnologyRow = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  iconName: string | null;
  iconUrl: string | null;
  websiteUrl: string | null;
  _count: { projects: number };
};

export function TechnologiesTable({
  technologies,
}: {
  technologies: TechnologyRow[];
}) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const technologyToDelete = technologies.find((tech) => tech.id === deleteId);

  async function handleDelete() {
    if (!deleteId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/technologies/${deleteId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete technology");
      }

      toast.success("Technology deleted");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete technology");
    } finally {
      setIsDeleting(false);
    }
  }

  if (technologies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No technologies yet. Create one to use on projects and your about page.
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Projects</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {technologies.map((technology) => (
            <TableRow key={technology.id}>
              <TableCell>
                <TechnologyIcon technology={technology} size={24} />
              </TableCell>
              <TableCell className="font-medium">{technology.name}</TableCell>
              <TableCell>{technology.category ?? "—"}</TableCell>
              <TableCell>
                <code className="text-xs">{technology.slug}</code>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{technology._count.projects}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/technologies/${technology.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={technology._count.projects > 0}
                    onClick={() => setDeleteId(technology.id)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete technology</DialogTitle>
            <DialogDescription>
              Delete {technologyToDelete?.name}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
