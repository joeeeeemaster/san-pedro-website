import { RoleAwareStaffLayout } from "@/components/layouts/role-aware-staff-layout";
import { BlotterManagement } from "@/components/staff/blotter-management";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import type { BlotterRow } from "@/lib/supabase/types";

export default async function BlotterPage() {
  const { profile } = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const { data: blotters } = await supabase
    .from("blotters")
    .select("*")
    .order("incident_datetime", { ascending: false });

  return (
    <RoleAwareStaffLayout role={profile.role} name={profile.full_name} avatarUrl={profile.avatar_url ?? undefined}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900">Blotter / Incident Records</h1>
      <BlotterManagement blotters={(blotters ?? []) as BlotterRow[]} />
    </RoleAwareStaffLayout>
  );
}
