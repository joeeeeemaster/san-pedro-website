import { redirect } from "next/navigation";

import { PortalLayout } from "@/components/layouts/portal-layout";
import { AnnouncementsBrowser } from "@/components/announcements-browser";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import type { AnnouncementRow } from "@/lib/supabase/types";

export default async function PortalAnnouncementsPage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");
  const { profile } = session;

  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <PortalLayout user={{ name: profile.full_name, avatarUrl: profile.avatar_url ?? undefined }}>
      <h1 className="font-display mb-5 text-2xl font-semibold text-maroon-900 dark:text-cream-50">
        Announcements &amp; News
      </h1>
      <AnnouncementsBrowser announcements={(announcements ?? []) as AnnouncementRow[]} basePath="/portal/announcements" />
    </PortalLayout>
  );
}
