import { RoleAwareStaffLayout } from "@/components/layouts/role-aware-staff-layout";
import { CertificateGenerator } from "@/components/staff/certificate-generator";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import { PUNONG_BARANGAY } from "@/lib/data/officials";
import type { Profile } from "@/lib/supabase/types";

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: Promise<{ request_id?: string }>;
}) {
  const { profile } = await requireRole(["staff", "admin"]);
  const supabase = await createClient();
  const { request_id } = await searchParams;

  const { data: residents } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "resident")
    .order("full_name", { ascending: true });

  const { data: settings } = await supabase
    .from("barangay_settings")
    .select("official_seal_url, sk_logo_url")
    .eq("id", true)
    .single();
  const logos = {
    seal: settings?.official_seal_url || "/brand/logos/official-seal.png",
    skLogo: settings?.sk_logo_url || "/brand/logos/sk-logo.png",
  };

  let prefill;
  if (request_id) {
    const { data: request } = await supabase
      .from("document_requests")
      .select("*")
      .eq("id", request_id)
      .single();
    if (request) {
      prefill = {
        residentId: request.resident_id,
        documentType: request.document_type,
        purpose: request.purpose ?? "",
        address: request.address ?? "",
        requestId: request.id,
      };
    }
  }

  return (
    <RoleAwareStaffLayout role={profile.role} name={profile.full_name} avatarUrl={profile.avatar_url ?? undefined}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900">Generate Certificate</h1>
      <CertificateGenerator
        residents={(residents ?? []) as Profile[]}
        punongBarangay={PUNONG_BARANGAY}
        logos={logos}
        prefill={prefill}
      />
    </RoleAwareStaffLayout>
  );
}
