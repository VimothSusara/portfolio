import { requireAdmin } from "@/lib/auth/get-admin-user";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <AdminSidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AdminHeader username={user.username} />
        <main className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
