import Image from "next/image";
import { ClipboardList, ShieldAlert, FileText, TrendingUp } from "lucide-react";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { ReportControls } from "@/components/admin/report-controls";
import { PrintButtons } from "@/components/admin/print-buttons";
import { Card, CardContent } from "@/components/ui/card";
import { requireRole } from "@/lib/supabase/require-role";
import { createClient } from "@/lib/supabase/server";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import type { DocumentRequestRow } from "@/lib/supabase/types";

function startOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { profile } = await requireRole(["admin"]);
  const { from, to } = await searchParams;
  const rangeFrom = from ?? startOfMonthISO();
  const rangeTo = to ?? todayISO();
  const toExclusive = new Date(new Date(rangeTo).getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const supabase = await createClient();

  const [{ data: requests }, { count: blottersFiled }, { data: residents }, { data: settings }] = await Promise.all([
    supabase
      .from("document_requests")
      .select("*")
      .gte("requested_at", rangeFrom)
      .lt("requested_at", toExclusive),
    supabase
      .from("blotters")
      .select("id", { count: "exact", head: true })
      .gte("incident_datetime", rangeFrom)
      .lt("incident_datetime", toExclusive),
    supabase.from("profiles").select("created_at").eq("role", "resident"),
    supabase.from("barangay_settings").select("official_seal_url, sk_logo_url").eq("id", true).single(),
  ]);
  const sealUrl = settings?.official_seal_url || "/brand/logos/official-seal.png";
  const skLogoUrl = settings?.sk_logo_url || "/brand/logos/sk-logo.png";

  const allRequests = (requests ?? []) as DocumentRequestRow[];
  const requestsProcessed = allRequests.length;
  const completed = allRequests.filter((r) => r.status === "released").length;
  const inProgress = allRequests.filter((r) => r.status === "processing" || r.status === "ready").length;
  const pending = allRequests.filter((r) => r.status === "pending").length;
  const rejected = allRequests.filter((r) => r.status === "rejected").length;

  const byType = DOCUMENT_TYPES.map((doc) => ({
    name: doc.name,
    received: allRequests.filter((r) => r.document_type === doc.dbType).length,
    completed: allRequests.filter((r) => r.document_type === doc.dbType && r.status === "released").length,
    pending: allRequests.filter((r) => r.document_type === doc.dbType && r.status !== "released" && r.status !== "rejected").length,
  })).sort((a, b) => b.received - a.received);
  const topDoc = byType[0];

  const residentsInRange = (residents ?? []).filter(
    (r) => r.created_at >= rangeFrom && r.created_at < toExclusive
  ).length;
  const residentsTotal = residents?.length ?? 0;
  const growthPct = residentsTotal > 0 ? Math.round((residentsInRange / residentsTotal) * 1000) / 10 : 0;

  const rangeLabel = `${new Date(rangeFrom).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })} – ${new Date(rangeTo).toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" })}`;

  return (
    <AdminLayout user={{ name: profile.full_name, role: "Punong Barangay" }}>
      <h1 className="font-display mb-4 text-2xl font-semibold text-maroon-900 dark:text-cream-50 print:hidden">
        Reports &amp; Analytics
      </h1>

      <div className="print:hidden">
        <ReportControls from={rangeFrom} to={rangeTo} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <StatCard icon={ClipboardList} label="Requests Processed" value={requestsProcessed} />
        <StatCard icon={ShieldAlert} label="Blotters Filed" value={blottersFiled ?? 0} />
        <StatCard icon={FileText} label="Top Document" value={topDoc?.name ?? "—"} sub={topDoc ? `${topDoc.received} requests` : undefined} />
        <StatCard icon={TrendingUp} label="Resident Growth" value={`${growthPct}%`} sub={`${residentsInRange} new in range`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 print:hidden">
        <Card className="dark:bg-maroon-700">
          <CardContent className="p-5">
            <p className="font-display mb-3 text-lg font-semibold text-maroon-900 dark:text-cream-50">
              Activity by Module
            </p>
            <div className="space-y-2 text-sm">
              <ModuleBar label="Requests" value={requestsProcessed} max={Math.max(requestsProcessed, 1)} color="bg-maroon-500" />
              <ModuleBar label="Blotters" value={blottersFiled ?? 0} max={Math.max(requestsProcessed, blottersFiled ?? 0, 1)} color="bg-mayon-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-maroon-700">
          <CardContent className="p-5">
            <p className="font-display mb-3 text-lg font-semibold text-maroon-900 dark:text-cream-50">
              Request Status
            </p>
            <div className="space-y-2 text-sm">
              <StatusBar label="Completed" value={completed} total={requestsProcessed} color="bg-bamboo-green-500" />
              <StatusBar label="In Progress" value={inProgress} total={requestsProcessed} color="bg-gold-500" />
              <StatusBar label="Pending" value={pending} total={requestsProcessed} color="bg-mayon-blue-500" />
              <StatusBar label="Rejected" value={rejected} total={requestsProcessed} color="bg-festival-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Printable summary */}
      <div className="print-area mt-6 rounded-card border border-black/5 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between border-b border-maroon-900/10 pb-4">
          <Image src={sealUrl} alt="" width={56} height={56} className="rounded-full" />
          <div className="text-center">
            <p className="font-display text-xl font-bold text-maroon-900">BARANGAY SAN PEDRO</p>
            <p className="text-sm text-maroon-900/70">Monthly Operations Report</p>
            <p className="text-xs text-maroon-900/50">{rangeLabel}</p>
          </div>
          <Image src={skLogoUrl} alt="" width={56} height={56} className="rounded-full" />
        </div>

        <div className="mt-5 grid grid-cols-4 gap-4 text-center">
          <PrintStat label="Total Requests" value={requestsProcessed} />
          <PrintStat label="Completed" value={completed} />
          <PrintStat label="Pending" value={pending} />
          <PrintStat label="Rejected" value={rejected} />
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-maroon-900/20 text-left">
              <th className="py-2">Document Type</th>
              <th className="py-2 text-right">Received</th>
              <th className="py-2 text-right">Completed</th>
              <th className="py-2 text-right">Pending</th>
            </tr>
          </thead>
          <tbody>
            {byType.map((row) => (
              <tr key={row.name} className="border-b border-maroon-900/10">
                <td className="py-2">{row.name}</td>
                <td className="py-2 text-right">{row.received}</td>
                <td className="py-2 text-right">{row.completed}</td>
                <td className="py-2 text-right">{row.pending}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-2">TOTAL</td>
              <td className="py-2 text-right">{requestsProcessed}</td>
              <td className="py-2 text-right">{completed}</td>
              <td className="py-2 text-right">{pending}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-10 grid grid-cols-2 gap-8 text-center text-sm">
          <div>
            <p className="border-b border-maroon-900/40 pb-1">&nbsp;</p>
            <p className="mt-1 text-xs text-maroon-900/60">Prepared by</p>
          </div>
          <div>
            <p className="border-b border-maroon-900/40 pb-1 font-semibold text-maroon-900">{profile.full_name}</p>
            <p className="mt-1 text-xs text-maroon-900/60">Punong Barangay</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3 print:hidden">
        <PrintButtons />
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <Card className="dark:bg-maroon-700">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-maroon-100 text-maroon-500">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-maroon-900/60 dark:text-cream-50/60">{label}</p>
          <p className="font-display text-xl font-semibold leading-tight text-maroon-900 dark:text-cream-50">{value}</p>
          {sub && <p className="text-xs text-maroon-900/40 dark:text-cream-50/40">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ModuleBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-maroon-900/70 dark:text-cream-50/70">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-cream-100 dark:bg-maroon-900">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function StatusBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-maroon-900/70 dark:text-cream-50/70">
        <span>{label}</span>
        <span className="font-medium">{value} ({pct}%)</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-cream-100 dark:bg-maroon-900">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PrintStat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold text-maroon-900">{value}</p>
      <p className="text-xs text-maroon-900/60">{label}</p>
    </div>
  );
}

