import {
    FolderKanban,
    LayoutDashboard,
    Mail,
    User,
    type LucideIcon,
  } from "lucide-react";
  
  export type AdminNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
  };
  
  export const adminNav: AdminNavItem[] = [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Profile", href: "/admin/profile", icon: User },
    { title: "Projects", href: "/admin/projects", icon: FolderKanban },
    { title: "Messages", href: "/admin/messages", icon: Mail },
  ];