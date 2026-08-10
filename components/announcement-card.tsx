import Image from "next/image";
import Link from "next/link";

import type { AnnouncementRow } from "@/lib/supabase/types";
import { CategoryBadge, DateBadge } from "@/components/ui/badge";

function excerptOf(content: string, max = 140) {
  const firstParagraph = content.split("\n\n")[0] ?? content;
  return firstParagraph.length > max ? firstParagraph.slice(0, max).trimEnd() + "…" : firstParagraph;
}

export function AnnouncementCard({
  announcement,
  basePath = "/announcements",
}: {
  announcement: AnnouncementRow;
  basePath?: string;
}) {
  const date = new Date(announcement.published_at ?? announcement.created_at);

  return (
    <Link
      href={`${basePath}/${announcement.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-black/5 dark:border-white/10 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {announcement.cover_image_url && (
          <Image
            src={announcement.cover_image_url}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <DateBadge date={date} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <CategoryBadge category={announcement.category} />
        <p className="font-display text-base font-semibold leading-snug text-maroon-900 dark:text-cream-50">
          {announcement.title}
        </p>
        <p className="line-clamp-2 flex-1 text-sm text-maroon-900/70 dark:text-cream-50/70">
          {excerptOf(announcement.content)}
        </p>
        <span className="text-sm font-semibold text-maroon-500 group-hover:underline">
          Read more →
        </span>
      </div>
    </Link>
  );
}
