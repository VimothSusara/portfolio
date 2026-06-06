"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
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

type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: "PENDING" | "READ" | "ARCHIVED" | "SPAM";
  createdAt: string | Date;
};

const statusVariant: Record<
  ContactMessageRow["status"],
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "default",
  READ: "secondary",
  ARCHIVED: "outline",
  SPAM: "destructive",
};

export function MessagesTable({ messages }: { messages: ContactMessageRow[] }) {
  const router = useRouter();
  const [viewMessage, setViewMessage] = useState<ContactMessageRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function updateStatus(id: string, status: ContactMessageRow["status"]) {
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to update");

      toast.success(`Marked as ${status.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/messages/${deleteId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to delete");

      toast.success("Message deleted");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  }

  async function openMessage(message: ContactMessageRow) {
    setViewMessage(message);
    if (message.status === "PENDING") {
      await updateStatus(message.id, "READ");
    }
  }

  if (messages.length === 0) {
    return <p className="text-sm text-muted-foreground">No messages yet.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>From</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Received</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{message.name}</p>
                  <p className="text-xs text-muted-foreground">{message.email}</p>
                </div>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {message.subject || "(no subject)"}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[message.status]}>{message.status}</Badge>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openMessage(message)}>
                    <Eye className="size-4" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(message.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!viewMessage} onOpenChange={(open) => !open && setViewMessage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewMessage?.subject || "Contact message"}</DialogTitle>
            <DialogDescription>
              From {viewMessage?.name} ({viewMessage?.email})
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm">{viewMessage?.message}</p>
          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewMessage && updateStatus(viewMessage.id, "ARCHIVED")}
              >
                Archive
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => viewMessage && updateStatus(viewMessage.id, "SPAM")}
              >
                Spam
              </Button>
            </div>
            <Button size="sm" onClick={() => setViewMessage(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete message</DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}