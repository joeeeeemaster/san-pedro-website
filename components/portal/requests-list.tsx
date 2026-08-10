"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Plus, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import {
  REQUEST_STATUS_STEPS,
  REQUEST_STATUS_LABEL,
  type DocumentRequestRow,
  type RequestStatus,
} from "@/lib/supabase/types";

const TABS: { key: RequestStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "ready", label: "Ready" },
  { key: "released", label: "Released" },
];

export function RequestsList({ requests }: { requests: DocumentRequestRow[] }) {
  const [tab, setTab] = useState<RequestStatus | "all">("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: requests.length };
    for (const status of ["pending", "processing", "ready", "released", "rejected"]) {
      c[status] = requests.filter((r) => r.status === status).length;
    }
    return c;
  }, [requests]);

  const filtered = requests.filter((r) => {
    const doc = DOCUMENT_TYPES.find((d) => d.dbType === r.document_type);
    const matchesTab = tab === "all" || r.status === tab;
    const matchesQuery = (doc?.name ?? "").toLowerCase().includes(query.trim().toLowerCase());
    return matchesTab && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-card border border-black/5 dark:border-white/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "bg-maroon-500 text-white"
                  : "bg-cream-100 dark:bg-maroon-900 text-maroon-900/70 dark:text-cream-50/70 hover:bg-cream-100/70"
              )}
            >
              {t.label} {counts[t.key] ? counts[t.key] : 0}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-900/40 dark:text-cream-50/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search requests..."
            className="w-full rounded-md border border-black/10 dark:border-white/20 py-2 pl-9 pr-3 text-sm outline-none focus:border-maroon-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-card border border-black/5 dark:border-white/10 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-maroon-900/60 dark:text-cream-50/60">No requests found.</p>
          <Button asChild size="sm" className="mt-3">
            <Link href="/portal/requests/new">
              <Plus className="h-4 w-4" /> New Request
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((r) => (
            <RequestCard key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestCard({ request }: { request: DocumentRequestRow }) {
  const doc = DOCUMENT_TYPES.find((d) => d.dbType === request.document_type);
  const currentIndex = REQUEST_STATUS_STEPS.indexOf(
    request.status as (typeof REQUEST_STATUS_STEPS)[number]
  );
  // Every step the request has reached — including the current one — is
  // complete. There's no separate "in progress" visual state: reaching
  // "Ready" means Ready is done, not still pending.

  return (
    <div className="flex flex-col gap-4 rounded-card border border-black/5 dark:border-white/10 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-maroon-100 text-maroon-500">
          {doc ? <doc.icon className="h-5 w-5" /> : null}
        </span>
        <div>
          <p className="font-display text-base font-semibold text-maroon-900 dark:text-cream-50">{doc?.name ?? request.document_type}</p>
          <p className="text-xs text-maroon-900/50 dark:text-cream-50/50">
            {new Date(request.requested_at).toLocaleDateString("en-PH", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </p>
          {request.purpose && <p className="text-xs text-maroon-900/60 dark:text-cream-50/60">{request.purpose}</p>}
        </div>
      </div>

      {request.status === "rejected" ? (
        <span className="w-fit rounded-full bg-festival-red-100 px-3 py-1 text-xs font-semibold text-festival-red-600">
          Rejected
        </span>
      ) : (
        <div className="flex items-center">
          {REQUEST_STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[10px]",
                    i <= currentIndex ? "border-bamboo-green-500 bg-bamboo-green-500 text-white" : "border-black/15"
                  )}
                >
                  {i <= currentIndex && <Check className="h-3 w-3" />}
                </div>
                <span className="w-14 text-center text-[10px] text-maroon-900/50 dark:text-cream-50/50">
                  {REQUEST_STATUS_LABEL[step]}
                </span>
              </div>
              {i < REQUEST_STATUS_STEPS.length - 1 && (
                <div
                  className={cn("mx-1 h-0.5 w-8", i < currentIndex ? "bg-bamboo-green-500" : "bg-black/10")}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <span className="w-fit rounded-full bg-cream-100 dark:bg-maroon-900 px-3 py-1 text-xs font-semibold text-maroon-900/70 dark:text-cream-50/70 md:ml-4">
        {REQUEST_STATUS_LABEL[request.status]}
      </span>
    </div>
  );
}
