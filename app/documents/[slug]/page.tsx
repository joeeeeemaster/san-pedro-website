import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowLeft } from "lucide-react";

import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import { ACCENT_CLASSES } from "@/lib/accent-classes";

export function generateStaticParams() {
  return DOCUMENT_TYPES.map((doc) => ({ slug: doc.slug }));
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = DOCUMENT_TYPES.find((d) => d.slug === slug);
  if (!doc) notFound();

  const accent = ACCENT_CLASSES[doc.accent];
  const Icon = doc.icon;

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-12 md:px-10">
        <Link
          href="/documents"
          className="inline-flex items-center gap-1 text-sm font-medium text-maroon-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Documents
        </Link>

        <div className={`mt-6 flex items-start gap-4 rounded-card border-t-4 bg-white p-6 shadow-sm ${accent.border}`}>
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${accent.iconBg}`}>
            <Icon className={`h-7 w-7 ${accent.text}`} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-maroon-900">{doc.name}</h1>
            <p className="mt-1 text-sm text-maroon-900/70">{doc.description}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <Stat label="Processing Fee" value={`₱${doc.fee.toFixed(2)}`} />
          <Stat label="Processing Time" value={doc.processingTime} />
          <Stat label="Validity" value={doc.validity} />
        </div>

        <div className="mt-6 rounded-card border border-black/5 bg-white p-6 shadow-sm">
          <p className="font-display text-lg font-semibold text-maroon-900">Requirements</p>
          <ul className="mt-3 space-y-2">
            {doc.requirements.map((req) => (
              <li key={req} className="flex items-start gap-2 text-sm text-maroon-900/80">
                <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${accent.text}`} />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex gap-3">
          <Button asChild>
            <Link href="/login">Request Online</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/documents">View Other Documents</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-black/5 bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-maroon-900/50">{label}</p>
      <p className="font-display mt-1 text-lg font-semibold text-maroon-900">{value}</p>
    </div>
  );
}
