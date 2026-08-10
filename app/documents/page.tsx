import Link from "next/link";
import { MapPin, Clock, Phone, Footprints, Check } from "lucide-react";

import { PublicLayout } from "@/components/layouts/public-layout";
import { Button } from "@/components/ui/button";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import { ACCENT_CLASSES } from "@/lib/accent-classes";

export const metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-maroon-500 py-16 text-center text-white">
        <div className="relative mx-auto max-w-3xl px-6">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Barangay Document Services
          </h1>
          <p className="mt-2 text-lg text-gold-400">Request online or visit our office.</p>
          <p className="mt-4 text-sm text-cream-50/85">
            We are here to serve you. Request official documents online for your convenience,
            or visit our office during office hours for walk-in requests.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-5 px-6 py-12 sm:grid-cols-2 md:px-10">
        {DOCUMENT_TYPES.map((doc) => {
          const accent = ACCENT_CLASSES[doc.accent];
          const Icon = doc.icon;
          return (
            <div
              key={doc.slug}
              className={`flex flex-col gap-4 rounded-card border-t-4 bg-white p-6 shadow-sm ${accent.border}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${accent.iconBg}`}>
                  <Icon className={`h-6 w-6 ${accent.text}`} />
                </div>
                <span className={`rounded-md px-3 py-1 text-center text-sm font-semibold ${accent.badgeBg}`}>
                  ₱{doc.fee.toFixed(2)}
                  <span className="block text-[10px] font-normal">Processing Fee</span>
                </span>
              </div>

              <div>
                <p className="font-display text-lg font-semibold text-maroon-900">{doc.name}</p>
                <p className="mt-1 text-sm text-maroon-900/70">{doc.description}</p>
              </div>

              <ul className="space-y-1.5">
                {doc.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-sm text-maroon-900/80">
                    <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${accent.text}`} />
                    {req}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex gap-3 pt-2">
                <Button asChild size="sm" className="flex-1">
                  <Link href="/login">Request Online</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/documents/${doc.slug}`}>View Details</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16 md:px-10">
        <div className="grid gap-6 rounded-card border border-gold-500/40 bg-gold-100/60 p-6 sm:grid-cols-4">
          <InfoItem icon={Footprints} label="Walk-in Requests" value="Prefer to process in person? Visit our office during office hours." />
          <InfoItem icon={MapPin} label="Office Address" value="Barangay San Pedro, Bacacay, Albay, 4513 Philippines" />
          <InfoItem icon={Clock} label="Office Hours" value="Monday – Friday, 8:00 AM – 5:00 PM" />
          <InfoItem icon={Phone} label="Contact Number" value="(052) 123-4567" />
        </div>
      </section>
    </PublicLayout>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-maroon-500" />
      <div>
        <p className="font-display text-sm font-semibold text-maroon-900">{label}</p>
        <p className="text-xs text-maroon-900/70">{value}</p>
      </div>
    </div>
  );
}
