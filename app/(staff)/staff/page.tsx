import Link from "next/link";
import { FileClock, ShieldAlert, Users, Truck } from "lucide-react";

import { RoleAwareStaffLayout } from "@/components/layouts/role-aware-staff-layout";
import { Card, CardContent } from "@/components/ui/card";
import { WeeklyRequestsChart, MonthlyTrendChart } from "@/components/staff/dashboard-charts";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import { buildWeeklyByType, buildMonthlyTrend } from "@/lib/chart-aggregation";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import { REQUEST_STATUS_LABEL, type DocumentRequestRow } from "@/lib/supabase/types";

export default async function StaffDashboardPage() {
  const { profile } = await requireRole(["staff", "admin"]);
  const supabase = await createClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    { count: pendingCount },
    { count: blottersToday },
    { count: totalResidents },
    { data: equipmentRows },
    { data: chartRequests },
    { data: recentRequests },
  ] = await Promise.all([
    supabase.from("document_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("blotters")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date().toISOString().slice(0, 10)),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "resident"),
    supabase.from("equipment").select("total_quantity, available_quantity"),
    supabase
      .from("document_requests")
      .select("*")
      .gte("requested_at", sixMonthsAgo.toISOString()),
    supabase
      .from("document_requests")
      .select("*, profiles(full_name)")
      .order("requested_at", { ascending: false })
      .limit(6),
  ]);

  const equipmentRented =
    equipmentRows?.reduce((sum, e) => sum + (e.total_quantity - e.available_quantity), 0) ?? 0;

  const allChartRequests = (chartRequests ?? []) as DocumentRequestRow[];
  const weeklyData = buildWeeklyByType(
    allChartRequests.filter((r) => new Date(r.requested_at) >= sevenDaysAgo)
  );
  const monthlyData = buildMonthlyTrend(allChartRequests);

  return (
    <RoleAwareStaffLayout role={profile.role} name={profile.full_name} avatarUrl={profile.avatar_url ?? undefined}>
      <h1 className="font-display text-2xl font-semibold text-maroon-900 dark:text-cream-50">Staff Dashboard</h1>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard href="/staff/requests" icon={FileClock} iconBg="bg-gold-100 text-gold-600" label="Pending Requests" value={pendingCount ?? 0} />
        <KpiCard href="/staff/blotter" icon={ShieldAlert} iconBg="bg-maroon-100 text-maroon-500" label="Blotters Today" value={blottersToday ?? 0} />
        <KpiCard href="/staff/residents" icon={Users} iconBg="bg-mayon-blue-100 text-mayon-blue-500" label="Total Residents" value={totalResidents ?? 0} />
        <KpiCard href="/staff/equipment" icon={Truck} iconBg="bg-bamboo-green-100 text-bamboo-green-600" label="Equipment Rented" value={equipmentRented} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="font-display mb-2 text-lg font-semibold text-maroon-900">Weekly Requests by Type</p>
            <WeeklyRequestsChart data={weeklyData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="font-display mb-2 text-lg font-semibold text-maroon-900">Monthly Trend</p>
            <MonthlyTrendChart data={monthlyData} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-lg font-semibold text-maroon-900">Recent Document Requests</p>
            <Link href="/staff/requests" className="text-sm font-medium text-maroon-500 hover:underline">
              View All Requests →
            </Link>
          </div>
          {!recentRequests || recentRequests.length === 0 ? (
            <p className="py-6 text-center text-sm text-maroon-900/60">No requests yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs text-maroon-900/50">
                  <th className="pb-2 font-medium">Requestor</th>
                  <th className="pb-2 font-medium">Document Type</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(recentRequests as (DocumentRequestRow & { profiles: { full_name: string } | null })[]).map(
                  (r) => (
                    <tr key={r.id} className="border-b border-black/5 last:border-0">
                      <td className="py-2 text-maroon-900">{r.profiles?.full_name ?? "—"}</td>
                      <td className="py-2 text-maroon-900/70">
                        {DOCUMENT_TYPES.find((d) => d.dbType === r.document_type)?.name ?? r.document_type}
                      </td>
                      <td className="py-2 text-maroon-900/70">
                        {new Date(r.requested_at).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })}
                      </td>
                      <td className="py-2">
                        <span className="rounded-full bg-cream-100 px-2 py-1 text-xs font-semibold text-maroon-900/70">
                          {REQUEST_STATUS_LABEL[r.status]}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </RoleAwareStaffLayout>
  );
}

function KpiCard({
  icon: Icon,
  iconBg,
  label,
  value,
  href,
}: {
  icon: typeof FileClock;
  iconBg: string;
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <Card className={href ? "transition-shadow hover:shadow-md" : undefined}>
      <CardContent className="flex items-center gap-4 p-5">
        <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-maroon-900/60">{label}</p>
          <p className="font-display text-2xl font-semibold text-maroon-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

