"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type GithubSyncButtonProps = {
  lastSync?: {
    status: string;
    startedAt: string | Date;
    finishedAt?: string | Date | null;
    errorMessage?: string | null;
  } | null;
};

export function GithubSyncButton({ lastSync }: GithubSyncButtonProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    setIsSyncing(true);

    try {
      const response = await fetch("/api/admin/github-sync", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Sync failed");
      }

      const orgCount = data.organizationCount ?? 0;
      const orgRepoCount = data.orgRepoCount ?? 0;
      toast.success(
        `Synced ${data.totalContributions?.toLocaleString() ?? 0} contributions, ${data.repoCount ?? 0} repos (${orgRepoCount} org), ${orgCount} organizations`,
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="default"
          disabled={isSyncing}
          onClick={handleSync}
        >
          {isSyncing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Sync GitHub now
        </Button>
      </div>

      {lastSync && (
        <p className="text-xs text-muted-foreground">
          Last job:{" "}
          <span
            className={
              lastSync.status === "SUCCESS"
                ? "text-foreground"
                : lastSync.status === "FAILED"
                  ? "text-destructive"
                  : ""
            }
          >
            {lastSync.status.toLowerCase()}
          </span>{" "}
          · started {new Date(lastSync.startedAt).toLocaleString()}
          {lastSync.finishedAt
            ? ` · finished ${new Date(lastSync.finishedAt).toLocaleString()}`
            : ""}
          {lastSync.errorMessage ? ` — ${lastSync.errorMessage}` : ""}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Updates the public page at{" "}
        <Link href="/analytics" className="underline underline-offset-4">
          /analytics
        </Link>
        .
      </p>
    </div>
  );
}
