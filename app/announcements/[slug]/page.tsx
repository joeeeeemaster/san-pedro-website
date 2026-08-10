import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PublicLayout } from "@/components/layouts/public-layout";
import { CategoryBadge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: announcement } = await supabase
    .from("announcements")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!announcement) notFound();

  const date = new Date(announcement.published_at ?? announcement.created_at);

  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        <Link
          href="/announcements"
          className="inline-flex items-center gap-1 text-sm font-medium text-maroon-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Announcements
        </Link>

        {announcement.cover_image_url && (
          <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-card">
            <Image src={announcement.cover_image_url} alt="" fill className="object-cover" />
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <CategoryBadge category={announcement.category} />
          <span className="text-sm text-maroon-900/60">
            {date.toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })}
          </span>
        </div>

        <h1 className="font-display mt-2 text-3xl font-semibold text-maroon-900">
          {announcement.title}
        </h1>

        <div className="mt-5 space-y-4 text-sm leading-relaxed text-maroon-900/80">
          {announcement.content.split("\n\n").map((paragraph: string, i: number) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </PublicLayout>
  );
}
