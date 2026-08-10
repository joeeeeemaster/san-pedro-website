"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface NotificationItem {
  text: string;
  at: string;
  href: string;
  isNew: boolean;
}

export function NotificationsBell({
  variant,
  dark = false,
}: {
  variant: "resident" | "staff";
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Load on mount (not just on click) so the unread badge is correct the
  // moment the page loads, not only after the user has already opened it.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  async function load() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("notifications_last_seen_at")
      .eq("id", user.id)
      .single();
    const lastSeen = profile?.notifications_last_seen_at ?? "1970-01-01T00:00:00Z";

    let raw: { text: string; at: string; href: string }[] = [];

    if (variant === "resident") {
      const { data } = await supabase
        .from("document_requests")
        .select("id, document_type, status, updated_at")
        .eq("resident_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);
      raw = (data ?? []).map((r) => ({
        text: `${r.document_type.replace(/_/g, " ")} request is now ${r.status}`,
        at: r.updated_at,
        href: "/portal/requests",
      }));
    } else {
      const [{ data: requests }, { data: blotters }] = await Promise.all([
        supabase
          .from("document_requests")
          .select("id, document_type, status, updated_at")
          .eq("status", "pending")
          .order("updated_at", { ascending: false })
          .limit(3),
        supabase
          .from("blotters")
          .select("id, case_no, status, updated_at")
          .eq("status", "Open")
          .order("updated_at", { ascending: false })
          .limit(3),
      ]);
      raw = [
        ...(requests ?? []).map((r) => ({
          text: `New pending ${r.document_type.replace(/_/g, " ")} request`,
          at: r.updated_at,
          href: "/staff/requests",
        })),
        ...(blotters ?? []).map((b) => ({
          text: `Blotter ${b.case_no} is open`,
          at: b.updated_at,
          href: "/staff/blotter",
        })),
      ].sort((a, b) => (a.at < b.at ? 1 : -1));
    }

    const withNewFlags = raw.slice(0, 5).map((n) => ({ ...n, isNew: n.at > lastSeen }));
    setItems(withNewFlags);
    setUnreadCount(withNewFlags.filter((n) => n.isNew).length);
  }

  async function handleOpen() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && unreadCount > 0) {
      // Clear the badge right away; the list itself keeps showing which
      // items were new for this viewing (matches the isNew flags already
      // captured from load()) until the next full reload recalculates them.
      setUnreadCount(0);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ notifications_last_seen_at: new Date().toISOString() })
          .eq("id", user.id);
      }
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        onClick={handleOpen}
        className={`relative ${dark ? "text-cream-50/80" : "text-maroon-900/70"}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-festival-red-500 px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-md border border-black/10 bg-white shadow-lg">
          <p className="border-b border-black/5 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-maroon-900/50">
            Notifications
          </p>
          {items === null ? (
            <p className="px-3 py-4 text-center text-sm text-maroon-900/50">Loading...</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-4 text-center text-sm text-maroon-900/50">No new notifications.</p>
          ) : (
            <ul>
              {items.map((n, i) => (
                <li key={i} className="border-b border-black/5 last:border-0">
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block border-l-4 px-3 py-2.5 text-sm hover:bg-cream-50",
                      n.isNew ? "border-l-festival-red-500 bg-festival-red-100/30" : "border-l-transparent"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="capitalize text-maroon-900">{n.text}</p>
                      {n.isNew && (
                        <span className="flex-shrink-0 rounded-full bg-festival-red-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-maroon-900/40">
                      {new Date(n.at).toLocaleString("en-PH", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
