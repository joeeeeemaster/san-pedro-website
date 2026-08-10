import { RoleAwareStaffLayout } from "@/components/layouts/role-aware-staff-layout";
import { RequestsManagement } from "@/components/staff/requests-management";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";

export default async function StaffRequestsPage() {
  const { profile } = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("document_requests")
    .select("*, profiles(full_name, mobile_number, email)")
    .order("requested_at", { ascending: false });

  return (
    <RoleAwareStaffLayout role={profile.role} name={profile.full_name} avatarUrl={profile.avatar_url ?? undefined}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900">Document Requests</h1>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RequestsManagement requests={(requests ?? []) as any} />
    </RoleAwareStaffLayout>
  );
}
