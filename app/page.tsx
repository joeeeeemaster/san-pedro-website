import Image from "next/image";
import Link from "next/link";
import { FileText, Megaphone, Landmark, ArrowRight } from "lucide-react";

import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { AnnouncementCard } from "@/components/announcement-card";
import { createClient } from "@/lib/supabase/server";
import type { AnnouncementRow } from "@/lib/supabase/types";

const SERVICE_CARDS = [
  {
    href: "/documents",
    icon: FileText,
    accent: "border-maroon-500 text-maroon-500",
    title: "Document Requests",
    description: "Request, track, and manage official documents online.",
  },
  {
    href: "/announcements",
    icon: Megaphone,
    accent: "border-gold-500 text-gold-600",
    title: "Announcements",
    description: "Stay updated with the latest news and important notices.",
  },
  {
    href: "/about",
    icon: Landmark,
    accent: "border-mayon-blue-500 text-mayon-blue-500",
    title: "About Our Barangay",
    description: "Learn about our history, leaders, services, and programs.",
  },
] as const;

export default async function HomePage() {
  const supabase = await createClient();
  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  return (
    <PublicLayout>
      <section className="relative flex min-h-[560px] items-center overflow-hidden">
        <Image
          src="/brand/tier-1/hero-mayon-golden-hour.png"
          alt="Mayon Volcano at golden hour with the San Pedro community"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maroon-900/80 via-maroon-900/40 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 py-24 md:px-10">
          <h1 className="font-display max-w-2xl text-4xl font-semibold text-white sm:text-5xl">
            Bridging Faith and Heritage
          </h1>
          <p className="mt-3 max-w-xl text-lg text-cream-50/90">
            Honoring Señor San Pedro, Celebrating the Sarimanok Festival.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/documents">Request a Document</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              <Link href="/announcements">View Announcements</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 grid max-w-6xl gap-5 px-6 md:grid-cols-3 md:px-10">
        {SERVICE_CARDS.map(({ href, icon: Icon, accent, title, description }) => (
          <Link
            key={href}
            href={href}
            className={`group flex items-start gap-4 rounded-card border-t-4 bg-white p-6 shadow-md transition-transform hover:-translate-y-0.5 ${accent}`}
          >
            <Icon className="h-8 w-8 flex-shrink-0" />
            <div>
              <p className="font-display text-lg font-semibold text-maroon-900">{title}</p>
              <p className="mt-1 text-sm text-maroon-900/70">{description}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium">
                Learn more
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold text-maroon-900">
            Latest News &amp; Announcements
          </h2>
          <Link
            href="/announcements"
            className="text-sm font-semibold text-maroon-500 hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {((announcements ?? []) as AnnouncementRow[]).map((announcement) => (
            <AnnouncementCard key={announcement.slug} announcement={announcement} />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
