import { RoleAwareStaffLayout } from "@/components/layouts/role-aware-staff-layout";
import { AnnouncementsManagement } from "@/components/staff/announcements-management";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import type { AnnouncementRow } from "@/lib/supabase/types";

export default async function StaffAnnouncementsPage() {
  const { profile } = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <RoleAwareStaffLayout role={profile.role} name={profile.full_name} avatarUrl={profile.avatar_url ?? undefined}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900">Manage Announcements</h1>
      <AnnouncementsManagement announcements={(announcements ?? []) as AnnouncementRow[]} />
    </RoleAwareStaffLayout>
  );
}
