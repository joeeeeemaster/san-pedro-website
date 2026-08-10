import { RoleAwareStaffLayout } from "@/components/layouts/role-aware-staff-layout";
import { ResidentManagement } from "@/components/staff/resident-management";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export default async function ResidentsPage() {
  const { profile } = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const { data: residents } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "resident")
    .order("full_name", { ascending: true });

  return (
    <RoleAwareStaffLayout role={profile.role} name={profile.full_name} avatarUrl={profile.avatar_url ?? undefined}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900">Resident Management</h1>
      <ResidentManagement residents={(residents ?? []) as Profile[]} />
    </RoleAwareStaffLayout>
  );
}
