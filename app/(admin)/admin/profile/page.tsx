import { AdminLayout } from "@/components/layouts/admin-layout";
import { StaffAdminProfileForm } from "@/components/account/staff-admin-profile";
import { requireRole } from "@/lib/supabase/require-role";

export default async function AdminProfilePage() {
  const { userId, profile } = await requireRole(["admin"]);

  return (
    <AdminLayout user={{ name: profile.full_name, role: "Punong Barangay", avatarUrl: profile.avatar_url ?? undefined }}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900 dark:text-cream-50">My Profile</h1>
      <StaffAdminProfileForm userId={userId} initialProfile={profile} />
    </AdminLayout>
  );
}
