import { redirect } from "next/navigation";
import Link from "next/link";
import { FileClock, CheckCircle2, Megaphone, Plus } from "lucide-react";

import { PortalLayout } from "@/components/layouts/portal-layout";
import { AnnouncementCard } from "@/components/announcement-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import {
  REQUEST_STATUS_LABEL,
  type DocumentRequestRow,
  type AnnouncementRow,
} from "@/lib/supabase/types";

export default async function ResidentDashboardPage() {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");
  const { userId, profile } = session;

  const supabase = await createClient();
  const [{ data: requests }, { count: announcementCount }, { data: latestAnnouncements }] =
    await Promise.all([
      supabase
        .from("document_requests")
        .select("*")
        .eq("resident_id", userId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("announcements")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("announcements")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(2),
    ]);

  const allRequests = (requests ?? []) as DocumentRequestRow[];
  const activeCount = allRequests.filter((r) =>
    ["pending", "processing", "ready"].includes(r.status)
  ).length;
  const completedCount = allRequests.filter((r) => r.status === "released").length;
  const recentActivity = allRequests.slice(0, 4);
  const firstName = profile.full_name.split(" ")[0] || profile.full_name;

  return (
    <PortalLayout user={{ name: profile.full_name, avatarUrl: profile.avatar_url ?? undefined }}>
      <div className="rounded-card bg-maroon-500 p-6 text-white">
        <h1 className="font-display text-2xl font-semibold">Welcome back, {firstName}!</h1>
        <p className="mt-1 text-sm text-cream-50/80">
          Here&apos;s what&apos;s happening with your barangay services today.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={FileClock}
          iconBg="bg-gold-100 text-gold-600"
          label="Active Requests"
          value={activeCount}
          sublabel="Requests in progress"
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-bamboo-green-100 text-bamboo-green-600"
          label="Completed Requests"
          value={completedCount}
          sublabel="Successfully resolved"
        />
        <StatCard
          icon={Megaphone}
          iconBg="bg-mayon-blue-100 text-mayon-blue-600"
          label="New Announcements"
          value={announcementCount ?? 0}
          sublabel="Latest updates"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">Recent Activity</p>
              <Link href="/portal/requests" className="text-sm font-medium text-maroon-500 hover:underline">
                View All →
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <p className="py-8 text-center text-sm text-maroon-900/60 dark:text-cream-50/60">
                No requests yet.{" "}
                <Link href="/portal/requests/new" className="font-medium text-maroon-500 hover:underline">
                  Request your first document →
                </Link>
              </p>
            ) : (
              <ul className="space-y-4">
                {recentActivity.map((r) => {
                  const doc = DOCUMENT_TYPES.find((d) => d.dbType === r.document_type);
                  return (
                    <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                      <div>
                        <p className="font-medium text-maroon-900 dark:text-cream-50">{doc?.name ?? r.document_type}</p>
                        <p className="text-xs text-maroon-900/50 dark:text-cream-50/50">
                          {new Date(r.updated_at).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="rounded-full bg-cream-100 dark:bg-maroon-900 px-2.5 py-1 text-xs font-semibold text-maroon-900/70 dark:text-cream-50/70">
                        {REQUEST_STATUS_LABEL[r.status]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">Latest Announcements</p>
              <Link href="/portal/announcements" className="text-sm font-medium text-maroon-500 hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {((latestAnnouncements ?? []) as AnnouncementRow[]).map((a) => (
                <AnnouncementCard key={a.slug} announcement={a} basePath="/portal/announcements" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        asChild
        size="lg"
        className="fixed bottom-8 right-8 rounded-full shadow-lg"
      >
        <Link href="/portal/requests/new">
          <Plus className="h-5 w-5" /> New Request
        </Link>
      </Button>
    </PortalLayout>
  );
}

function StatCard({
  icon: Icon,
  iconBg,
  label,
  value,
  sublabel,
}: {
  icon: typeof FileClock;
  iconBg: string;
  label: string;
  value: number;
  sublabel: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-maroon-900/60 dark:text-cream-50/60">{label}</p>
          <p className="font-display text-2xl font-semibold text-maroon-900 dark:text-cream-50">{value}</p>
          <p className="text-xs text-maroon-900/40 dark:text-cream-50/40">{sublabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}

