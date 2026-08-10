"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Search, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, STAFF_NAV_ITEMS } from "@/lib/nav-items";
import { useTheme } from "@/components/theme-provider";
import { useLogos } from "@/lib/hooks/use-logos";
import { UserMenu } from "@/components/user-menu";
import { NotificationsBell } from "@/components/notifications-bell";

export interface AdminUser {
  name: string;
  role: string;
  avatarUrl?: string;
}

export function AdminLayout({
  children,
  user = { name: "Admin", role: "Punong Barangay" },
}: {
  children: React.ReactNode;
  user?: AdminUser;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { seal, skLogo } = useLogos();

  return (
    <div className="flex min-h-screen bg-cream-100 dark:bg-maroon-900">
      <aside
        className="relative flex w-64 flex-shrink-0 flex-col overflow-hidden bg-maroon-500 px-4 py-6 text-cream-50"
        style={{
          backgroundImage: "url(/brand/tier-1/sidebar-watermark-sarimanok.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="relative mb-8 flex items-center gap-2 px-2">
          <Image src={seal} alt="" width={36} height={36} className="rounded-full" />
          <Image src={skLogo} alt="" width={36} height={36} className="rounded-full" />
          <span className="font-display text-base font-semibold text-gold-400">
            San Pedro Admin
          </span>
        </div>

        <nav className="relative flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-gold-500 text-maroon-900" : "text-cream-50/85 hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <p className="relative mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-cream-50/50">
          Staff Modules
        </p>
        <nav className="relative flex flex-1 flex-col gap-1">
          {STAFF_NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-gold-500 text-maroon-900" : "text-cream-50/85 hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-black/5 bg-white px-6 py-3 dark:border-white/10 dark:bg-maroon-700">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-900/40 dark:text-cream-50/40" />
            <input
              placeholder="Search dashboard..."
              className="w-full rounded-md border border-black/10 bg-cream-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-maroon-400 dark:border-white/10 dark:bg-maroon-900 dark:text-cream-50"
            />
          </div>

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
              <Sun className="h-3.5 w-3.5" /> Light
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-1",
                theme === "dark" ? "bg-maroon-500 text-white" : "text-maroon-900/40 dark:text-cream-50/50"
              )}
            >
              <Moon className="h-3.5 w-3.5" /> Dark Mode
            </span>
          </button>

          <NotificationsBell variant="staff" />
          <UserMenu name={user.name} avatarUrl={user.avatarUrl} profileHref="/admin/profile" />
          <span className="hidden text-xs text-maroon-900/40 dark:text-cream-50/40 sm:inline">{user.role}</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 dark:text-cream-50">{children}</main>
      </div>
    </div>
  );
}
