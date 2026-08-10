import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<string, string> = {
  Fiesta: "bg-maroon-500 text-white",
  "Public Works": "bg-bamboo-green-500 text-white",
  Assembly: "bg-mayon-blue-500 text-white",
  Health: "bg-bamboo-green-500 text-white",
  Environment: "bg-bamboo-green-500 text-white",
  Events: "bg-mayon-blue-500 text-white",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        CATEGORY_STYLES[category] ?? "bg-maroon-100 text-maroon-600"
      )}
    >
      {category}
    </span>
  );
}

export function DateBadge({ date }: { date: Date }) {
  return (
    <div className="flex w-14 flex-col items-center rounded-md bg-gold-500 py-1 text-maroon-900 shadow-sm">
      <span className="text-[10px] font-semibold uppercase leading-none">
        {date.toLocaleDateString("en-PH", { month: "short" })}
      </span>
      <span className="text-lg font-bold leading-tight">{date.getDate()}</span>
      <span className="text-[10px] leading-none">{date.getFullYear()}</span>
    </div>
  );
}
