import {
  BarChart3,
  Cpu,
  FolderKanban,
  Images,
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
  { title: "Technologies", href: "/admin/technologies", icon: Cpu },
  { title: "Media", href: "/admin/media", icon: Images },
  { title: "Messages", href: "/admin/messages", icon: Mail },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];
