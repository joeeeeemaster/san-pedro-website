"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, User, LogOut } from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function UserMenu({
  name,
  avatarUrl,
  profileHref,
  dark = false,
}: {
  name: string;
  avatarUrl?: string;
  profileHref: string;
  dark?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative flex items-center gap-1.5" ref={ref}>
      {/* Clicking the photo/name itself goes straight to the profile page */}
      <Link href={profileHref} className="flex items-center gap-2">
        <span className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-maroon-100 text-sm font-semibold text-maroon-500">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name} fill className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center">{name.charAt(0)}</span>
          )}
        </span>
        <span className={`hidden text-sm font-medium sm:inline ${dark ? "text-cream-50" : "text-maroon-900"}`}>
          {name}
        </span>
      </Link>

      {/* The chevron alone opens the Profile / Log Out dropdown */}
      <button onClick={() => setOpen((v) => !v)} aria-label="Account menu">
        <ChevronDown className={`h-4 w-4 ${dark ? "text-cream-50/60" : "text-maroon-900/60"}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-md border border-black/10 bg-white py-1 shadow-lg">
          <Link
            href={profileHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-maroon-900 hover:bg-cream-50"
          >
            <User className="h-4 w-4" /> Profile
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-festival-red-600 hover:bg-festival-red-100/50"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>
      )}
    </div>
  );
}
