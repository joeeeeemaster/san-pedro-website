"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { RESIDENT_NAV_ITEMS } from "@/lib/nav-items";
import { useLogos } from "@/lib/hooks/use-logos";
import { useTheme } from "@/components/theme-provider";
import { UserMenu } from "@/components/user-menu";
import { NotificationsBell } from "@/components/notifications-bell";

export interface PortalUser {
  name: string;
  avatarUrl?: string;
}

export function PortalLayout({
  children,
  user = { name: "Resident" },
}: {
  children: React.ReactNode;
  user?: PortalUser;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const { seal, skLogo } = useLogos();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-maroon-900">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-6 border-b border-black/5 bg-white px-6 py-3 dark:border-white/10 dark:bg-maroon-700 md:px-10">
        <Link href="/portal" className="flex items-center gap-3">
          <Image src={seal} alt="Barangay San Pedro Official Seal" width={40} height={40} className="rounded-full" />
          <Image src={skLogo} alt="Sangguniang Kabataan San Pedro Logo" width={40} height={40} className="rounded-full" />
          <span className="font-display text-lg font-semibold text-maroon-500 dark:text-gold-400 sm:text-xl">
            Barangay San Pedro
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {RESIDENT_NAV_ITEMS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b-2 pb-1 text-sm font-medium transition-colors",
                  active
                    ? "border-maroon-500 text-maroon-500 dark:border-gold-400 dark:text-gold-400"
                    : "border-transparent text-maroon-900/70 hover:text-maroon-500 dark:text-cream-50/70 dark:hover:text-gold-400"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex items-center gap-1 rounded-full border border-black/10 bg-cream-50 p-1 text-xs font-medium dark:border-white/10 dark:bg-maroon-900"
          >
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1",
                theme === "light" ? "bg-gold-400 text-maroon-900" : "text-maroon-900/40 dark:text-cream-50/50"
              )}
            >
              <Sun className="h-3.5 w-3.5" />
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1",
                theme === "dark" ? "bg-maroon-500 text-white" : "text-maroon-900/40 dark:text-cream-50/50"
              )}
            >
              <Moon className="h-3.5 w-3.5" />
            </span>
          </button>
          <NotificationsBell variant="resident" />
          <UserMenu name={user.name} avatarUrl={user.avatarUrl} profileHref="/portal/profile" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 dark:text-cream-50 md:px-10">{children}</main>

      <div className="h-2 bg-maroon-500" role="presentation" />
    </div>
  );
}
