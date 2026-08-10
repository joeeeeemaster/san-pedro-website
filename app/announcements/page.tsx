import { PublicLayout } from "@/components/layouts/public-layout";
import { AnnouncementsBrowser } from "@/components/announcements-browser";
import { createClient } from "@/lib/supabase/server";
import type { AnnouncementRow } from "@/lib/supabase/types";

export const metadata = { title: "Announcements" };

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <PublicLayout>
      <section className="bg-maroon-500 py-14 text-center text-white">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Announcements &amp; News</h1>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <AnnouncementsBrowser announcements={(announcements ?? []) as AnnouncementRow[]} />
      </section>
    </PublicLayout>
  );
}
