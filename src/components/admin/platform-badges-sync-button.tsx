"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type PlatformBadgesSyncButtonProps = {
  lastSync?: {
    status: string;
    startedAt: string | Date;
    finishedAt?: string | Date | null;
    errorMessage?: string | null;
  } | null;
  leetcodeConfigured: boolean;
  hackerrankConfigured: boolean;
};

export function PlatformBadgesSyncButton({
  lastSync,
  leetcodeConfigured,
  hackerrankConfigured,
}: PlatformBadgesSyncButtonProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  const canSync = leetcodeConfigured || hackerrankConfigured;

  async function handleSync() {
    setIsSyncing(true);

    try {
      const response = await fetch("/api/admin/platform-badges-sync", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Sync failed");
      }

      const parts: string[] = [];
      if (data.leetcodeBadgeCount > 0) {
        parts.push(`${data.leetcodeBadgeCount} LeetCode`);
      }
      if (data.hackerrankBadgeCount > 0) {
        parts.push(`${data.hackerrankBadgeCount} HackerRank`);
      }

      if (parts.length > 0) {
        toast.success(`Synced ${parts.join(" and ")} badge(s)`);
      } else {
        toast.success("Sync completed (no badges found)");
      }
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
          disabled={isSyncing || !canSync}
          onClick={handleSync}
        >
          {isSyncing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Sync platform badges
        </Button>
      </div>

      {!canSync && (
        <p className="text-xs text-muted-foreground">
          Set <code className="rounded bg-muted px-1">LEETCODE_USERNAME</code>{" "}
          and/or <code className="rounded bg-muted px-1">HACKERRANK_USERNAME</code>{" "}
          in your environment to enable sync.
        </p>
      )}

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
        Pulls public badges into the database and updates the{" "}
        <Link href="/about" className="underline underline-offset-4" target="_blank">
          about page
        </Link>
        . Manual certifications are not changed.
      </p>
    </div>
  );
}
