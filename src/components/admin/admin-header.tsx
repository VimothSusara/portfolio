"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { toast } from "sonner";

type AdminHeaderProps = {
  username: string;
};

export function AdminHeader({ username }: AdminHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      toast.error("Failed to log out");
      return;
    }
    toast.success("Logged out");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3">
        <AdminMobileNav />
        <div>
          <p className="text-sm font-medium">Welcome back</p>
          <p className="text-xs text-muted-foreground">{username}</p>
        </div>
      </div>

      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="size-4" />
        Logout
      </Button>
    </header>
  );
}