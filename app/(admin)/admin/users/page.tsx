import { AdminLayout } from "@/components/layouts/admin-layout";
import { UserManagement } from "@/components/admin/user-management";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export default async function UsersPage() {
  const { userId, profile } = await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminLayout user={{ name: profile.full_name, role: "Punong Barangay" }}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900 dark:text-cream-50">
        User Management
      </h1>
      <UserManagement users={(users ?? []) as Profile[]} currentUserId={userId} />
    </AdminLayout>
  );
}
