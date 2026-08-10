import { RoleAwareStaffLayout } from "@/components/layouts/role-aware-staff-layout";
import { EquipmentManagement } from "@/components/staff/equipment-management";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentRow, EquipmentRentalRow } from "@/lib/supabase/types";

export default async function EquipmentPage() {
  const { profile } = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const [{ data: equipment }, { data: rentals }] = await Promise.all([
    supabase.from("equipment").select("*").order("name", { ascending: true }),
    supabase
      .from("equipment_rentals")
      .select("*, equipment(name)")
      .order("date_out", { ascending: true }),
  ]);

  return (
    <RoleAwareStaffLayout role={profile.role} name={profile.full_name} avatarUrl={profile.avatar_url ?? undefined}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900">Equipment Rental Tracking</h1>
      <EquipmentManagement
        equipment={(equipment ?? []) as EquipmentRow[]}
        rentals={(rentals ?? []) as (EquipmentRentalRow & { equipment: { name: string } | null })[]}
      />
    </RoleAwareStaffLayout>
  );
}
