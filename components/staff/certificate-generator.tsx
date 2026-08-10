"use client";

import { useState } from "react";
import Image from "next/image";
import { Save, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import type { Profile } from "@/lib/supabase/types";
import type { Official } from "@/lib/data/officials";

export function CertificateGenerator({
  residents,
  punongBarangay,
  logos,
  prefill,
}: {
  residents: Profile[];
  punongBarangay: Official;
  logos: { seal: string; skLogo: string };
  prefill?: { residentId?: string; documentType?: string; purpose?: string; address?: string; requestId?: string };
}) {
  const [residentId, setResidentId] = useState(prefill?.residentId ?? "");
  const [documentType, setDocumentType] = useState(prefill?.documentType ?? DOCUMENT_TYPES[0].dbType);
  const [purpose, setPurpose] = useState(prefill?.purpose ?? "");
  const [address, setAddress] = useState(prefill?.address ?? "");
  const [issuedDate, setIssuedDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const resident = residents.find((r) => r.id === residentId);
  const doc = DOCUMENT_TYPES.find((d) => d.dbType === documentType);
  const issuedDateLabel = new Date(issuedDate + "T00:00:00").toLocaleDateString("en-PH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function handleSave() {
    if (!resident || !doc) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("certificates")
      .insert({
        request_id: prefill?.requestId ?? null,
        resident_id: resident.id,
        document_type: doc.dbType,
        purpose,
        address,
        issued_date: issuedDate,
      })
      .select("certificate_no")
      .single();
    setSaving(false);
    if (!error && data) setSaved(data.certificate_no);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
      <div className="space-y-4 rounded-card border border-black/5 bg-white p-5 shadow-sm">
        <p className="font-display text-lg font-semibold text-maroon-900">Request Details</p>

        <Field label="Select Resident">
          <select
            value={residentId}
            onChange={(e) => setResidentId(e.target.value)}
            className="w-full rounded-md border border-black/10 px-2.5 py-2 text-sm outline-none focus:border-maroon-400"
          >
            <option value="">Search resident...</option>
            {residents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.full_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Document Type">
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full rounded-md border border-black/10 px-2.5 py-2 text-sm outline-none focus:border-maroon-400"
          >
            {DOCUMENT_TYPES.map((d) => (
              <option key={d.dbType} value={d.dbType}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Purpose">
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full rounded-md border border-black/10 px-2.5 py-2 text-sm outline-none focus:border-maroon-400"
          />
        </Field>

        <Field label="Address">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-md border border-black/10 px-2.5 py-2 text-sm outline-none focus:border-maroon-400"
          />
        </Field>

        <Field label="Date Issued">
          <input
            type="date"
            value={issuedDate}
            onChange={(e) => setIssuedDate(e.target.value)}
            className="w-full rounded-md border border-black/10 px-2.5 py-2 text-sm outline-none focus:border-maroon-400"
          />
        </Field>

        {saved && (
          <p className="rounded-md bg-bamboo-green-100 px-3 py-2 text-xs text-bamboo-green-700">
            Saved as {saved}. Uploaded requirements and issuance are now on record.
          </p>
        )}

        <div className="flex gap-2 pt-2 print:hidden">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleSave}
            disabled={saving || !resident || !purpose || !address}
          >
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Record"}
          </Button>
          <Button className="flex-1" onClick={() => window.print()} disabled={!resident}>
            <Printer className="h-4 w-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      <div className="rounded-card border border-black/5 bg-cream-100 p-6 shadow-sm print:border-0 print:bg-white print:p-0 print:shadow-none">
        <div
          id="certificate-preview"
          className="print-area mx-auto max-w-2xl rounded-md border-4 border-double border-maroon-500 bg-white p-10 text-center"
        >
          <div className="flex items-center justify-between">
            <Image src={logos.seal} alt="" width={64} height={64} className="rounded-full" />
            <div>
              <p className="text-xs text-maroon-900/70">Republic of the Philippines</p>
              <p className="text-xs text-maroon-900/70">Province of Albay</p>
              <p className="text-xs text-maroon-900/70">Municipality of Bacacay</p>
              <p className="font-display text-base font-bold text-maroon-500">BARANGAY SAN PEDRO</p>
            </div>
            <Image src={logos.skLogo} alt="" width={64} height={64} className="rounded-full" />
          </div>

          <h1 className="font-display mt-6 text-2xl font-bold uppercase tracking-wide text-maroon-900">
            {doc?.name ?? "Certificate"}
          </h1>

          <p className="mt-6 text-left text-sm italic leading-relaxed text-maroon-900/80">
            To Whom It May Concern:
          </p>
          <p className="mt-3 text-left text-sm leading-relaxed text-maroon-900/90">
            This is to certify that{" "}
            <span className="font-bold uppercase">{resident?.full_name ?? "___________________"}</span>, of
            legal age, Filipino, and a resident of{" "}
            <span className="font-semibold">{address || "___________________"}</span>, is a bona fide
            resident of this barangay with good moral character and has no derogatory record in our files.
          </p>
          <p className="mt-3 text-left text-sm leading-relaxed text-maroon-900/90">
            This certification is issued upon the request of the above-named resident for{" "}
            <span className="font-semibold">{purpose || "___________________"}</span> purposes.
          </p>
          <p className="mt-3 text-left text-sm leading-relaxed text-maroon-900/90">
            Issued this {issuedDateLabel} at Barangay San Pedro, Bacacay, Albay, Philippines.
          </p>

          <div className="mt-10 text-center">
            <p className="font-display border-b border-maroon-900/40 pb-1 text-lg font-semibold text-maroon-900">
              {punongBarangay.name}
            </p>
            <p className="text-xs text-maroon-900/60">{punongBarangay.position}</p>
          </div>

          {saved && <p className="mt-6 text-xs text-maroon-900/50">{saved}</p>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-maroon-900">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
