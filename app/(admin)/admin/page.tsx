import Link from "next/link";
import { Users, ClipboardCheck, ShieldAlert, Megaphone } from "lucide-react";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent } from "@/components/ui/card";
import {
  MonthlyTrendChart,
  RequestsByTypeChart,
  ResidentDistributionChart,
  type RequestsByTypeDatum,
} from "@/components/staff/dashboard-charts";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import { buildMonthlyTrend } from "@/lib/chart-aggregation";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import type { DocumentRequestRow, Profile } from "@/lib/supabase/types";

export default async function AdminDashboardPage() {
  const { profile } = await requireRole(["admin"]);
  const supabase = await createClient();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    { count: totalResidents },
    { count: requestsThisMonth },
    { count: activeBlotters },
    { count: announcementsPublished },
    { data: chartRequests },
    { data: allResidents },
    { data: recentRequests },
    { data: recentBlotters },
    { data: recentAnnouncements },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "resident"),
    supabase
      .from("document_requests")
      .select("id", { count: "exact", head: true })
      .gte("requested_at", startOfMonth.toISOString()),
    supabase.from("blotters").select("id", { count: "exact", head: true }).neq("status", "Resolved"),
    supabase.from("announcements").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("document_requests").select("*").gte("requested_at", sixMonthsAgo.toISOString()),
    supabase.from("profiles").select("purok_zone").eq("role", "resident"),
    supabase
      .from("document_requests")
      .select("*, profiles(full_name)")
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase.from("blotters").select("*").order("updated_at", { ascending: false }).limit(3),
    supabase
      .from("announcements")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(3),
  ]);

  const allChartRequests = (chartRequests ?? []) as DocumentRequestRow[];
  const monthlyData = buildMonthlyTrend(allChartRequests);

  const requestsByType: RequestsByTypeDatum[] = DOCUMENT_TYPES.map((doc) => {
    const rows = allChartRequests.filter((r) => r.document_type === doc.dbType);
    return {
      type: doc.name,
      received: rows.length,
      completed: rows.filter((r) => r.status === "released").length,
      inProgress: rows.filter((r) => r.status === "processing" || r.status === "ready").length,
      rejected: rows.filter((r) => r.status === "rejected").length,
    };
  });

  const purokCounts = new Map<string, number>();
  for (const r of (allResidents ?? []) as Pick<Profile, "purok_zone">[]) {
    const key = r.purok_zone?.trim() || "Unspecified";
    purokCounts.set(key, (purokCounts.get(key) ?? 0) + 1);
  }
  const residentDistribution = Array.from(purokCounts.entries())
    .map(([purok, count]) => ({ purok, count }))
    .sort((a, b) => b.count - a.count);

  const activity = [
    ...((recentRequests ?? []) as (DocumentRequestRow & { profiles: { full_name: string } | null })[]).map(
      (r) => ({
        icon: ClipboardCheck,
        color: "text-bamboo-green-600 bg-bamboo-green-100",
        text: `${DOCUMENT_TYPES.find((d) => d.dbType === r.document_type)?.name ?? "Document"} request ${r.status} — ${r.profiles?.full_name ?? "resident"}`,
        at: r.updated_at,
      })
    ),
    ...(recentBlotters ?? []).map((b) => ({
      icon: ShieldAlert,
      color: "text-maroon-500 bg-maroon-100",
      text: `Blotter ${b.case_no} — ${b.status}`,
      at: b.updated_at,
    })),
    ...(recentAnnouncements ?? []).map((a) => ({
      icon: Megaphone,
      color: "text-gold-600 bg-gold-100",
      text: `Announcement "${a.title}" — ${a.status}`,
      at: a.updated_at,
    })),
  ]
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 6);

  return (
    <AdminLayout user={{ name: profile.full_name, role: "Punong Barangay" }}>
      <h1 className="font-display text-2xl font-semibold text-maroon-900 dark:text-cream-50">
        Admin Dashboard
      </h1>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard href="/staff/residents" icon={Users} iconBg="bg-maroon-100 text-maroon-500" label="Total Residents" value={totalResidents ?? 0} />
        <KpiCard href="/staff/requests" icon={ClipboardCheck} iconBg="bg-gold-100 text-gold-600" label="Requests This Month" value={requestsThisMonth ?? 0} />
        <KpiCard href="/staff/blotter" icon={ShieldAlert} iconBg="bg-mayon-blue-100 text-mayon-blue-500" label="Active Blotters" value={activeBlotters ?? 0} />
        <KpiCard href="/staff/announcements" icon={Megaphone} iconBg="bg-bamboo-green-100 text-bamboo-green-600" label="Announcements Published" value={announcementsPublished ?? 0} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="dark:bg-maroon-700">
          <CardContent className="p-5">
            <p className="font-display mb-2 text-lg font-semibold text-maroon-900 dark:text-cream-50">
              Requests Overview
            </p>
            <MonthlyTrendChart data={monthlyData} />
          </CardContent>
        </Card>
        <Card className="dark:bg-maroon-700">
          <CardContent className="p-5">
            <p className="font-display mb-2 text-lg font-semibold text-maroon-900 dark:text-cream-50">
              Requests by Document Type
            </p>
            <RequestsByTypeChart data={requestsByType} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="dark:bg-maroon-700">
          <CardContent className="p-5">
            <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">
              Resident Distribution by Purok
            </p>
            {residentDistribution.length === 0 ? (
              <p className="text-sm text-maroon-900/50 dark:text-cream-50/50">No residents yet.</p>
            ) : (
              <ResidentDistributionChart data={residentDistribution} />
            )}
          </CardContent>
        </Card>

        <Card className="dark:bg-maroon-700">
          <CardContent className="p-5">
            <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">
              System Activity
            </p>
            {activity.length === 0 ? (
              <p className="text-sm text-maroon-900/50 dark:text-cream-50/50">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${a.color}`}>
                      <a.icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-maroon-900 dark:text-cream-50">{a.text}</p>
                      <p className="text-xs text-maroon-900/40 dark:text-cream-50/40">
                        {new Date(a.at).toLocaleString("en-PH", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function KpiCard({
  icon: Icon,
  iconBg,
  label,
  value,
  href,
}: {
  icon: typeof Users;
  iconBg: string;
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <Card className={`dark:bg-maroon-700 ${href ? "transition-shadow hover:shadow-md" : ""}`}>
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-maroon-900/60 dark:text-cream-50/60">{label}</p>
          <p className="font-display text-2xl font-semibold text-maroon-900 dark:text-cream-50">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

