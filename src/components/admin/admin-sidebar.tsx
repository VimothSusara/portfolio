"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNav } from "@/data/admin-navigation";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-64 shrink-0 border-r bg-muted/20 md:flex md:flex-col">
      <div className="border-b px-6 py-5">
        <Link href="/admin" className="text-lg font-semibold tracking-tight">
          Admin
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Portfolio CMS</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-4">
        {adminNav.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <Link
          href="/"
          target="_blank"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          View public site →
        </Link>
      </div>
    </aside>
  );
}
