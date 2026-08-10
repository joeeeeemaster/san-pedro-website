import type { DocumentRequestRow, RequestStatus } from "@/lib/supabase/types";
import type { WeeklyDatum, MonthlyDatum } from "@/components/staff/dashboard-charts";

/** Last 7 calendar days (oldest first), each day's requests broken out by document type. */
export function buildWeeklyByType(requests: DocumentRequestRow[]): WeeklyDatum[] {
  const days: WeeklyDatum[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString("en-PH", { month: "short", day: "2-digit" });

    const dayRequests = requests.filter((r) => r.requested_at.slice(0, 10) === dayKey);
    days.push({
      day: dayLabel,
      barangay_clearance: dayRequests.filter((r) => r.document_type === "barangay_clearance").length,
      certificate_of_indigency: dayRequests.filter((r) => r.document_type === "certificate_of_indigency").length,
      business_permit: dayRequests.filter((r) => r.document_type === "business_permit").length,
      barangay_id: dayRequests.filter((r) => r.document_type === "barangay_id").length,
    });
  }
  return days;
}

/** Last 6 calendar months (oldest first): requests received vs completed (released). */
export function buildMonthlyTrend(requests: DocumentRequestRow[]): MonthlyDatum[] {  const months: MonthlyDatum[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toISOString().slice(0, 7);
    const monthLabel = d.toLocaleDateString("en-PH", { month: "short" });

    const monthRequests = requests.filter((r) => r.requested_at.slice(0, 7) === monthKey);
    months.push({
      month: monthLabel,
      received: monthRequests.length,
      completed: monthRequests.filter((r) => r.status === ("released" as RequestStatus)).length,
    });
  }
  return months;
}

/** Last 7 calendar days (oldest first): requests received vs completed (released).
 *  Reuses the MonthlyDatum shape (field is still called `month`, just holding a day
 *  label here) so it can feed straight into <MonthlyTrendChart>. */
export function buildDailyTrend(requests: DocumentRequestRow[]): MonthlyDatum[] {
  const days: MonthlyDatum[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString("en-PH", { month: "short", day: "2-digit" });

    const dayRequests = requests.filter((r) => r.requested_at.slice(0, 10) === dayKey);
    days.push({
      month: dayLabel,
      received: dayRequests.length,
      completed: dayRequests.filter((r) => r.status === ("released" as RequestStatus)).length,
    });
  }
  return days;
}
