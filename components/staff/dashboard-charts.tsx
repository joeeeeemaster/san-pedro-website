"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface WeeklyDatum {
  day: string;
  barangay_clearance: number;
  certificate_of_indigency: number;
  business_permit: number;
  barangay_id: number;
}

export interface MonthlyDatum {
  month: string;
  received: number;
  completed: number;
}

const DOC_COLORS = {
  barangay_clearance: "#7A1A1A",
  certificate_of_indigency: "#F5C518",
  business_permit: "#4A7FB5",
  barangay_id: "#3A7D44",
};

export function WeeklyRequestsChart({ data }: { data: WeeklyDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
        <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="barangay_clearance" name="Barangay Clearance" fill={DOC_COLORS.barangay_clearance} radius={[2, 2, 0, 0]} />
        <Bar dataKey="certificate_of_indigency" name="Certificate of Residency" fill={DOC_COLORS.certificate_of_indigency} radius={[2, 2, 0, 0]} />
        <Bar dataKey="business_permit" name="Business Permit" fill={DOC_COLORS.business_permit} radius={[2, 2, 0, 0]} />
        <Bar dataKey="barangay_id" name="Barangay ID" fill={DOC_COLORS.barangay_id} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyTrendChart({ data }: { data: MonthlyDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="received" name="Requests Received" stroke="#7A1A1A" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="completed" name="Requests Completed" stroke="#F5C518" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export interface RequestsByTypeDatum {
  type: string;
  received: number;
  completed: number;
  inProgress: number;
  rejected: number;
}

export function RequestsByTypeChart({ data }: { data: RequestsByTypeDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
        <XAxis dataKey="type" fontSize={11} tickLine={false} axisLine={false} interval={0} />
        <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="received" name="Received" fill="#7A1A1A" radius={[2, 2, 0, 0]} />
        <Bar dataKey="completed" name="Completed" fill="#F5C518" radius={[2, 2, 0, 0]} />
        <Bar dataKey="inProgress" name="In Progress" fill="#4A7FB5" radius={[2, 2, 0, 0]} />
        <Bar dataKey="rejected" name="Rejected" fill="#3A7D44" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const PUROK_COLORS = ["#7A1A1A", "#F5C518", "#4A7FB5", "#3A7D44", "#D42B2B", "#8B5E3C"];

export function ResidentDistributionChart({ data }: { data: { purok: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width="55%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="purok" innerRadius={55} outerRadius={90} paddingAngle={2}>
            {data.map((_, i) => (
              <Cell key={i} fill={PUROK_COLORS[i % PUROK_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2 text-sm">
        <p className="font-display text-2xl font-semibold text-maroon-900">{total}</p>
        <p className="mb-2 text-xs text-maroon-900/50">Total Residents</p>
        {data.map((d, i) => (
          <div key={d.purok} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-maroon-900/70">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PUROK_COLORS[i % PUROK_COLORS.length] }}
              />
              {d.purok}
            </span>
            <span className="font-medium text-maroon-900">
              {d.count} ({total > 0 ? Math.round((d.count / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
