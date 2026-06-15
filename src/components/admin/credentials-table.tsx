"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { getCredentialImageUrl } from "@/lib/credentials/display";

type CredentialRow = {
  id: string;
  title: string;
  issuer: string | null;
  type: "CERTIFICATION" | "BADGE" | "AWARD";
  source: "MANUAL" | "LEETCODE" | "HACKERRANK";
  published: boolean;
  featured: boolean;
  sortOrder: number;
  iconUrl: string | null;
  image: { publicUrl: string } | null;
};

const typeLabels: Record<CredentialRow["type"], string> = {
  CERTIFICATION: "Certification",
  BADGE: "Badge",
  AWARD: "Award",
};

export function CredentialsTable({ credentials }: { credentials: CredentialRow[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const credentialToDelete = credentials.find((item) => item.id === deleteId);

  async function handleDelete() {
    if (!deleteId) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/credentials/${deleteId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to delete credential");
      }

      toast.success("Credential deleted");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete credential");
    } finally {
      setIsDeleting(false);
    }
  }

  if (credentials.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No credentials yet. Add certifications, badges, or awards to show on your about
        page.
      </p>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {credentials.map((credential) => {
            const imageUrl = getCredentialImageUrl(credential);

            return (
              <TableRow key={credential.id}>
                <TableCell>
                  {imageUrl ? (
                    <div className="relative size-10 overflow-hidden rounded-md border bg-muted/30">
                      <Image
                        src={imageUrl}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-md border bg-muted/30 text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{credential.title}</div>
                  {credential.issuer && (
                    <div className="text-xs text-muted-foreground">{credential.issuer}</div>
                  )}
                </TableCell>
                <TableCell>{typeLabels[credential.type]}</TableCell>
                <TableCell>
                  <Badge variant="outline">{credential.source}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {credential.published ? (
                      <Badge variant="default">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                    {credential.featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/credentials/${credential.id}/edit`}>
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(credential.id)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={Boolean(deleteId)} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete credential</DialogTitle>
            <DialogDescription>
              Delete {credentialToDelete?.title}? This cannot be undone.
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
