import Image from "next/image";
import Link from "next/link";
import { Sprout, Mountain, MapPin } from "lucide-react";

import { PublicLayout } from "@/components/layouts/public-layout";
import { PUNONG_BARANGAY, KAGAWAD } from "@/lib/data/officials";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="bg-maroon-500 py-10 text-white">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            About Barangay San Pedro
          </h1>
          <p className="mt-1 text-sm text-cream-50/80">
            <Link href="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            About
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:px-10">
        <div>
          <h2 className="font-display text-2xl font-semibold text-maroon-900">Our History</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-maroon-900/80">
            <p>
              Barangay San Pedro is one of the 27 barangays of Bacacay, Albay, nestled in the
              bountiful Bicol region at the foot of the majestic Mayon Volcano.
            </p>
            <p>
              Founded on strong faith, bayanihan, and a deep reverence for tradition, our
              barangay continues to thrive as a close-knit community built on unity and shared
              purpose.
            </p>
            <p>
              Through the years, we have preserved our cultural heritage while embracing
              progress, working hand in hand to build a safer, healthier, and more prosperous
              San Pedro for present and future generations.
            </p>
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-card border-4 border-gold-500">
          <Image
            src="/brand/tier-1/about-illustrated-landscape.png"
            alt="Illustration of Mayon Volcano overlooking Barangay San Pedro"
            fill
            className="object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12 md:px-10">
        <h2 className="font-display text-2xl font-semibold text-maroon-900">
          Barangay Officials
        </h2>

        <div className="mt-6 flex justify-center">
          <OfficialCard {...PUNONG_BARANGAY} featured />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {KAGAWAD.map((official) => (
            <OfficialCard key={official.name} {...official} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-card border-l-4 border-bamboo-green-500 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Sprout className="h-5 w-5 text-bamboo-green-500" />
              <p className="font-display font-semibold text-maroon-900">Mission</p>
            </div>
            <p className="text-sm text-maroon-900/75">
              To serve with integrity and compassion, promote inclusive development, and
              empower every resident through participatory governance, quality public service,
              and sustainable programs that uplift the lives of the San Pedreños.
            </p>
          </div>
          <div className="rounded-card border-l-4 border-mayon-blue-500 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Mountain className="h-5 w-5 text-mayon-blue-500" />
              <p className="font-display font-semibold text-maroon-900">Vision</p>
            </div>
            <p className="text-sm text-maroon-900/75">
              A peaceful, resilient, and progressive barangay where every San Pedreño lives in
              dignity, enjoys equal opportunities, and works together in preserving our
              heritage and nurturing a vibrant future.
            </p>
          </div>
          <div className="rounded-card border-l-4 border-maroon-500 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-maroon-500" />
              <p className="font-display font-semibold text-maroon-900">Find Our Barangay</p>
            </div>
            <p className="mb-3 text-sm text-maroon-900/75">
              San Pedro, Bacacay, Albay
              <br />
              4513 Philippines
            </p>
            <div className="aspect-[4/3] overflow-hidden rounded-md">
              <iframe
                title="Map location of Barangay San Pedro, Bacacay, Albay"
                src="https://www.google.com/maps?q=San+Pedro,+Bacacay,+Albay,+Philippines&output=embed"
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function OfficialCard({
  name,
  position,
  photo,
  featured = false,
}: {
  name: string;
  position: string;
  photo: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-card border bg-white p-4 text-center shadow-sm ${
        featured ? "w-56 border-gold-500 border-2" : "border-black/5"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-full ${
          featured ? "h-24 w-24" : "h-16 w-16"
        }`}
      >
        <Image src={photo} alt={name} fill className="object-cover" />
      </div>
      <p className="font-display mt-3 text-sm font-semibold text-maroon-900">{name}</p>
      <p className="text-xs text-maroon-900/60">{position}</p>
    </div>
  );
}
