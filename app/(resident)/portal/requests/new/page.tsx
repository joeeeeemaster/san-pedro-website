import { redirect } from "next/navigation";

import { PortalLayout } from "@/components/layouts/portal-layout";
import { RequestWizard } from "@/components/portal/request-wizard";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";

export default async function NewRequestPage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");
  const { userId, profile } = session;

  const defaultAddress = [profile.house_lot_no, profile.street, profile.purok_zone]
    .filter(Boolean)
    .join(", ");

  return (
    <PortalLayout user={{ name: profile.full_name, avatarUrl: profile.avatar_url ?? undefined }}>
      <h1 className="font-display text-2xl font-semibold text-maroon-900 dark:text-cream-50">
        Request a Barangay Document
      </h1>
      <p className="mt-1 text-sm text-maroon-900/60 dark:text-cream-50/60">
        Follow the steps below to request an official document.
      </p>

      <div className="mt-5">
        <RequestWizard
          userId={userId}
          defaultAddress={defaultAddress}
          defaultContact={profile.mobile_number ?? ""}
        />
      </div>
    </PortalLayout>
  );
}
