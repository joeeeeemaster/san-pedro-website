"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileBarChart } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ReportControls({ from, to }: { from: string; to: string }) {
  const router = useRouter();
  const [range, setRange] = useState({ from, to });

  function generate() {
    router.push(`/admin/reports?from=${range.from}&to=${range.to}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-card border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-maroon-700">
      <div>
        <label className="text-xs text-maroon-900/60 dark:text-cream-50/60">Report Type</label>
        <select className="mt-1 block rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400 dark:bg-maroon-900 dark:text-cream-50">
          <option>Monthly Summary</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-maroon-900/60 dark:text-cream-50/60">From</label>
        <input
          type="date"
          value={range.from}
          onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
          className="mt-1 block rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400 dark:bg-maroon-900 dark:text-cream-50"
        />
      </div>
      <div>
        <label className="text-xs text-maroon-900/60 dark:text-cream-50/60">To</label>
        <input
          type="date"
          value={range.to}
          onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
          className="mt-1 block rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400 dark:bg-maroon-900 dark:text-cream-50"
        />
      </div>
      <Button onClick={generate}>
        <FileBarChart className="h-4 w-4" /> Generate Report
      </Button>
    </div>
  );
}
