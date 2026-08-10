"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { AnnouncementCard } from "@/components/announcement-card";
import { cn } from "@/lib/utils";
import type { AnnouncementRow } from "@/lib/supabase/types";

export function AnnouncementsBrowser({
  announcements,
  basePath = "/announcements",
}: {
  announcements: AnnouncementRow[];
  basePath?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(announcements.map((a) => a.category)))],
    [announcements]
  );

  const filtered = useMemo(() => {
    return announcements
      .filter((a) => {
        const matchesCategory = category === "All" || a.category === category;
        const matchesQuery = a.title.toLowerCase().includes(query.trim().toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => ((a.published_at ?? a.created_at) < (b.published_at ?? b.created_at) ? 1 : -1));
  }, [announcements, query, category]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-900/40 dark:text-cream-50/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full rounded-md border border-black/10 dark:border-white/20 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-maroon-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === c
                  ? "border-maroon-500 bg-maroon-500 text-white"
                  : "border-black/10 dark:border-white/20 bg-white text-maroon-900/70 dark:text-cream-50/70 hover:border-maroon-300"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-sm text-maroon-900/60 dark:text-cream-50/60">
          No announcements match your search.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AnnouncementCard key={a.slug} announcement={a} basePath={basePath} />
          ))}
        </div>
      )}
    </div>
  );
}
