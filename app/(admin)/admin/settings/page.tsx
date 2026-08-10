import { AdminLayout } from "@/components/layouts/admin-layout";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import type { BarangaySettings } from "@/lib/supabase/types";

export default async function SettingsPage() {
  const { profile } = await requireRole(["admin"]);
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from("barangay_settings")
    .select("*")
    .eq("id", true)
    .single();

  return (
    <AdminLayout user={{ name: profile.full_name, role: "Punong Barangay" }}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900 dark:text-cream-50">
        System Settings
      </h1>
      <SettingsPanel initialSettings={settings as BarangaySettings} />
    </AdminLayout>
  );
}
