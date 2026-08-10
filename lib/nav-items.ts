import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  ShieldAlert,
  Truck,
  Megaphone,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** The 7 "STAFF MODULES" — shown in the Staff sidebar, and again under
 * a divider in the Admin sidebar, since admin can reach every staff tool. */
export const STAFF_NAV_ITEMS: NavItem[] = [
  { href: "/staff", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/residents", label: "Residents", icon: Users },
  { href: "/staff/requests", label: "Requests", icon: FileText },
  { href: "/staff/certificates", label: "Certificates", icon: Award },
  { href: "/staff/blotter", label: "Blotter", icon: ShieldAlert },
  { href: "/staff/equipment", label: "Equipment", icon: Truck },
  { href: "/staff/announcements", label: "Announcements", icon: Megaphone },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export const RESIDENT_NAV_ITEMS: Pick<NavItem, "href" | "label">[] = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/requests", label: "My Requests" },
  { href: "/portal/announcements", label: "Announcements" },
  { href: "/portal/profile", label: "Profile" },
];

export const PUBLIC_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/documents", label: "Documents" },
  { href: "/announcements", label: "Announcements" },
];
