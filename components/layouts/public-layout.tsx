"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Share2, Video } from "lucide-react";

import { cn } from "@/lib/utils";
import { PUBLIC_NAV_ITEMS } from "@/lib/nav-items";
import { Button } from "@/components/ui/button";
import { useLogos } from "@/lib/hooks/use-logos";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { seal, skLogo } = useLogos();

  return (
    <div className="flex min-h-screen flex-col bg-cream-50">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-6 border-b border-black/5 bg-white/95 px-6 py-3 backdrop-blur md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={seal}
            alt="Barangay San Pedro Official Seal"
            width={44}
            height={44}
            className="rounded-full"
          />
          <Image
            src={skLogo}
            alt="Sangguniang Kabataan San Pedro Logo"
            width={44}
            height={44}
            className="rounded-full"
          />
          <span className="font-display text-xl font-semibold text-maroon-500 sm:text-2xl">
            Barangay San Pedro
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {PUBLIC_NAV_ITEMS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b-2 pb-1 text-sm font-medium transition-colors",
                  active
                    ? "border-maroon-500 text-maroon-500"
                    : "border-transparent text-maroon-900/70 hover:text-maroon-500"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Button asChild size="sm">
          <Link href="/login">Login</Link>
        </Button>
      </header>

      <main className="flex-1">{children}</main>

      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-maroon-500 text-cream-50">
      <div
        className="h-9 bg-repeat-x"
        style={{
          backgroundImage: "url(/brand/tier-1/sarimanok-pattern-strip.png)",
          backgroundSize: "auto 100%",
        }}
        role="presentation"
      />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-3 md:px-10">
        <div>
          <p className="font-display text-lg font-semibold text-gold-400">Address</p>
          <p className="mt-1 text-sm leading-relaxed text-cream-100/90">
            Barangay San Pedro, Bacacay, Albay
            <br />
            4513 Philippines
          </p>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-gold-400">Contact Us</p>
          <p className="mt-1 text-sm leading-relaxed text-cream-100/90">
            (052) 123-4567
            <br />
            sanpedro.bacacay.albay@gmail.com
          </p>
          <div className="mt-3 flex gap-3">
            <SocialIcon icon={Share2} label="Facebook" />
            <SocialIcon icon={Video} label="YouTube" />
            <SocialIcon icon={Mail} label="Email" />
          </div>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-gold-400">Office Hours</p>
          <p className="mt-1 text-sm leading-relaxed text-cream-100/90">
            Monday – Friday
            <br />
            8:00 AM – 5:00 PM
            <br />
            Closed Saturdays, Sundays, and Holidays
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-4 text-center text-xs text-cream-100/70">
        © {new Date().getFullYear()} Barangay San Pedro, Bacacay, Albay. All rights reserved.
      </div>
    </footer>
  );
}

function SocialIcon({ icon: Icon, label }: { icon: typeof Mail; label: string }) {
  return (
    <span
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-cream-50/40 text-cream-50"
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}
