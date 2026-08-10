import { redirect } from "next/navigation";

import { PortalLayout } from "@/components/layouts/portal-layout";
import { ProfileForm } from "@/components/portal/profile-form";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import type { HouseholdMemberRow } from "@/lib/supabase/types";

export default async function MyProfilePage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");
  const { userId, profile } = session;

  const supabase = await createClient();
  const { data: household } = await supabase
    .from("household_members")
    .select("*")
    .eq("resident_id", userId)
    .order("created_at", { ascending: true });

  return (
    <PortalLayout user={{ name: profile.full_name, avatarUrl: profile.avatar_url ?? undefined }}>
      <h1 className="font-display mb-1 text-2xl font-semibold text-maroon-900">My Profile</h1>
      <p className="mb-5 text-sm text-maroon-900/60">
        Manage your personal and household information.
      </p>

      <ProfileForm
        userId={userId}
        initialProfile={profile}
        initialHousehold={(household ?? []) as HouseholdMemberRow[]}
      />
    </PortalLayout>
  );
}
