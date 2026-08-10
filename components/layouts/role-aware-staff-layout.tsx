import { StaffLayout } from "@/components/layouts/staff-layout";
import { AdminLayout } from "@/components/layouts/admin-layout";
import type { UserRole } from "@/lib/supabase/types";

export function RoleAwareStaffLayout({
  role,
  name,
  avatarUrl,
  children,
}: {
  role: UserRole;
  name: string;
  avatarUrl?: string;
  children: React.ReactNode;
}) {
  if (role === "admin") {
    return <AdminLayout user={{ name, role: "Punong Barangay", avatarUrl }}>{children}</AdminLayout>;
  }
  return <StaffLayout user={{ name, role: "Barangay Staff", avatarUrl }}>{children}</StaffLayout>;
}
