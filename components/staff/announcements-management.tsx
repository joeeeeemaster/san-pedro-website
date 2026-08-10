"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { AnnouncementCategory, AnnouncementRow, AnnouncementStatus } from "@/lib/supabase/types";

const CATEGORIES: AnnouncementCategory[] = ["Fiesta", "Public Works", "Assembly", "Health", "Environment", "Events"];

const COVER_IMAGES = [
  "/brand/tier-2/festival-sarimanok-dancer.png",
  "/brand/tier-2/medical-mission.png",
  "/brand/tier-2/road-repair.png",
  "/brand/tier-2/barangay-assembly.png",
  "/brand/tier-2/coastal-cleanup.png",
  "/brand/tier-2/flag-ceremony.png",
  "/brand/tier-2/fisherfolk-lake.png",
  "/brand/tier-2/scholarship-graduation.png",
];

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function blankDraft(): Partial<AnnouncementRow> {
  return {
    title: "",
    category: "Events",
    content: "",
    cover_image_url: COVER_IMAGES[0],
    status: "draft",
  };
}

export function AnnouncementsManagement({ announcements }: { announcements: AnnouncementRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AnnouncementRow | Partial<AnnouncementRow> | null>(
    announcements[0] ?? null
  );
  const [saving, setSaving] = useState(false);

  const filtered = announcements.filter((a) => a.title.toLowerCase().includes(query.trim().toLowerCase()));
  const isNew = selected && !("id" in selected && selected.id);

  function update<K extends keyof AnnouncementRow>(key: K, value: AnnouncementRow[K]) {
    setSelected((s) => (s ? { ...s, [key]: value } : s));
  }

  async function handleSave(publish: boolean) {
    if (!selected?.title || !selected?.content) return;
    setSaving(true);
    const supabase = createClient();
    const status: AnnouncementStatus = publish ? "published" : "draft";
    const payload = {
      title: selected.title,
      category: selected.category ?? "Events",
      content: selected.content,
      cover_image_url: selected.cover_image_url,
      status,
      published_at: publish ? new Date().toISOString() : (selected as AnnouncementRow).published_at ?? null,
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      const { data, error } = await supabase
        .from("announcements")
        .insert({ ...payload, slug: slugify(selected.title) })
        .select()
        .single();
      setSaving(false);
      if (!error && data) {
        setSelected(data);
        router.refresh();
      }
    } else {
      const { error } = await supabase
        .from("announcements")
        .update(payload)
        .eq("id", (selected as AnnouncementRow).id);
      setSaving(false);
      if (!error) {
        setSelected({ ...selected, ...payload });
        router.refresh();
      }
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-maroon-900">All Announcements</p>
          <Button size="sm" onClick={() => setSelected(blankDraft())}>
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search announcements..."
          className="mb-3 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400"
        />
        <div className="space-y-2">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelected(a)}
              className={cn(
                "flex w-full items-center gap-3 rounded-card border p-2.5 text-left transition-colors",
                selected && "id" in selected && selected.id === a.id
                  ? "border-gold-500 bg-gold-100/40"
                  : "border-black/5 bg-white hover:border-black/10"
              )}
            >
              {a.cover_image_url && (
                <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded-md">
                  <Image src={a.cover_image_url} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-maroon-900">{a.title}</p>
                <p className="text-xs text-maroon-900/50">
                  {new Date(a.published_at ?? a.created_at).toLocaleDateString("en-PH", { month: "short", day: "2-digit" })}
                </p>
              </div>
              <span
                className={cn(
                  "flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  a.status === "published" ? "bg-bamboo-green-100 text-bamboo-green-600" : "bg-gold-100 text-gold-600"
                )}
              >
                {a.status === "published" ? "Published" : "Draft"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-black/5 bg-white p-6 shadow-sm">
        {!selected ? (
          <p className="py-10 text-center text-sm text-maroon-900/50">Select or create an announcement.</p>
        ) : (
          <div>
            <p className="font-display mb-4 text-lg font-semibold text-maroon-900">
              {isNew ? "New Announcement" : "Edit Announcement"}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-maroon-900">Title</label>
                <input
                  value={selected.title ?? ""}
                  onChange={(e) => update("title", e.target.value)}
                  className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-maroon-900">Category</label>
                <select
                  value={selected.category ?? "Events"}
                  onChange={(e) => update("category", e.target.value as AnnouncementCategory)}
                  className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-maroon-900">Status</label>
                <div className="mt-1 flex h-[38px] items-center gap-2 rounded-md border border-black/10 px-3 text-sm">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      selected.status === "published" ? "bg-bamboo-green-500" : "bg-gold-500"
                    )}
                  />
                  {selected.status === "published" ? "Published" : "Draft"}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-maroon-900">Content</label>
                <textarea
                  value={selected.content ?? ""}
                  onChange={(e) => update("content", e.target.value)}
                  rows={6}
                  className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400"
                />
                <p className="mt-1 text-xs text-maroon-900/40">Separate paragraphs with a blank line.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-maroon-900">Cover Image</label>
                <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {COVER_IMAGES.map((src) => (
                    <button
                      key={src}
                      onClick={() => update("cover_image_url", src)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-md border-2",
                        selected.cover_image_url === src ? "border-gold-500" : "border-transparent"
                      )}
                    >
                      <Image src={src} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" disabled={saving} onClick={() => handleSave(false)}>
                Save Draft
              </Button>
              <Button disabled={saving} onClick={() => handleSave(true)}>
                {saving ? "Saving..." : "Publish"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
