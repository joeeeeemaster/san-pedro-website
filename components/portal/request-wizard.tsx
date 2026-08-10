"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Upload, X, FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import { ACCENT_CLASSES } from "@/lib/accent-classes";
import { createClient } from "@/lib/supabase/client";

const STEPS = ["Select Document", "Fill Details", "Upload & Submit"] as const;

export function RequestWizard({
  userId,
  defaultAddress,
  defaultContact,
}: {
  userId: string;
  defaultAddress: string;
  defaultContact: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [purpose, setPurpose] = useState("");
  const [address, setAddress] = useState(defaultAddress);
  const [contact, setContact] = useState(defaultContact);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDoc = DOCUMENT_TYPES.find((d) => d.slug === selectedSlug);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  }

  async function handleSubmit() {
    if (!selectedDoc) return;
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const requestId = crypto.randomUUID();
    const uploadedPaths: string[] = [];

    for (const file of files) {
      const path = `${userId}/${requestId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("document-requirements")
        .upload(path, file);
      if (uploadError) {
        setError(`Failed to upload ${file.name}: ${uploadError.message}`);
        setSubmitting(false);
        return;
      }
      uploadedPaths.push(path);
    }

    const { error: insertError } = await supabase.from("document_requests").insert({
      id: requestId,
      resident_id: userId,
      document_type: selectedDoc.dbType,
      purpose,
      address,
      contact_number: contact,
      status: "pending",
      uploaded_files: uploadedPaths,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    router.push("/portal/requests?submitted=1");
    router.refresh();
  }

  return (
    <div>
      <div className="rounded-card border border-black/5 dark:border-white/10 bg-white p-6 shadow-sm">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold",
                    i < step
                      ? "border-gold-500 bg-gold-500 text-maroon-900 dark:text-cream-50"
                      : i === step
                        ? "border-gold-500 text-gold-600"
                        : "border-black/15 text-maroon-900/30"
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap text-xs font-medium",
                    i <= step ? "text-maroon-900 dark:text-cream-50" : "text-maroon-900/40 dark:text-cream-50/40"
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("mx-2 h-0.5 flex-1", i < step ? "bg-gold-500" : "bg-black/10")} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-card border border-black/5 dark:border-white/10 bg-white p-6 shadow-sm">
        {step === 0 && (
          <div>
            <p className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">Select Document Type</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {DOCUMENT_TYPES.map((doc) => {
                const accent = ACCENT_CLASSES[doc.accent];
                const Icon = doc.icon;
                const selected = doc.slug === selectedSlug;
                return (
                  <button
                    key={doc.slug}
                    onClick={() => setSelectedSlug(doc.slug)}
                    className={cn(
                      "flex items-start gap-3 rounded-card border-2 p-4 text-left transition-colors",
                      selected ? `${accent.border} bg-gold-100/40` : "border-black/10 dark:border-white/20 hover:border-black/20"
                    )}
                  >
                    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${accent.iconBg}`}>
                      <Icon className={`h-5 w-5 ${accent.text}`} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-maroon-900 dark:text-cream-50">{doc.name}</p>
                      <p className="mt-0.5 text-xs text-maroon-900/60 dark:text-cream-50/60">{doc.description}</p>
                    </div>
                    {selected && (
                      <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-semibold text-maroon-900 dark:text-cream-50">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">Fill Details</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Purpose">
                <input
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Employment, School, etc."
                  className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm outline-none focus:border-maroon-400"
                />
              </Field>
              <Field label="Address">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete address"
                  className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm outline-none focus:border-maroon-400"
                />
              </Field>
              <Field label="Contact Number">
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Enter your contact number"
                  className="w-full rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm outline-none focus:border-maroon-400"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">Upload &amp; Submit</p>
            <p className="mt-1 text-sm text-maroon-900/60 dark:text-cream-50/60">
              Requirements for {selectedDoc?.name}: {selectedDoc?.requirements.join(", ")}
            </p>

            <label className="mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-black/15 p-8 text-center hover:border-maroon-300">
              <Upload className="h-6 w-6 text-maroon-900/40 dark:text-cream-50/40" />
              <span className="text-sm text-maroon-900/60 dark:text-cream-50/60">
                Click to upload files or drag and drop
                <br />
                <span className="text-xs">PDF, JPG, PNG up to 10MB each</span>
              </span>
              <input type="file" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>

            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between rounded-md border border-black/10 dark:border-white/20 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2 text-maroon-900/80">
                      <FileText className="h-4 w-4" /> {f.name}
                    </span>
                    <button onClick={() => setFiles((prev) => prev.filter((_, fi) => fi !== i))}>
                      <X className="h-4 w-4 text-maroon-900/40 dark:text-cream-50/40 hover:text-festival-red-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className="mt-3 rounded-md bg-festival-red-100 px-3 py-2 text-sm text-festival-red-600">
                {error}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-maroon-900/60 dark:text-cream-50/60">
          Need help? Contact the Barangay Office during office hours or call (052) 123-4567.
        </p>
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < 2 && (
            <Button disabled={step === 0 && !selectedSlug} onClick={() => setStep((s) => s + 1)}>
              Next
            </Button>
          )}
          {step === 2 && (
            <Button onClick={handleSubmit} disabled={submitting || files.length === 0}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-maroon-900 dark:text-cream-50">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
