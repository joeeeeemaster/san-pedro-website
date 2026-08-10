"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, X, ArrowRight, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { BlotterRow, BlotterSeverity, BlotterStatus } from "@/lib/supabase/types";

const SEVERITY_STYLES: Record<BlotterSeverity, string> = {
  Low: "bg-bamboo-green-100 text-bamboo-green-600",
  Medium: "bg-gold-100 text-gold-600",
  High: "bg-festival-red-100 text-festival-red-600",
};

const STATUS_STYLES: Record<string, string> = {
  Open: "bg-mayon-blue-100 text-mayon-blue-600",
  "Under Mediation": "bg-gold-100 text-gold-600",
  Resolved: "bg-bamboo-green-100 text-bamboo-green-600",
};

const EMPTY_FORM = {
  complainant_name: "",
  respondent_name: "",
  incident_type: "",
  incident_datetime: "",
  location: "",
  severity: "Medium" as BlotterSeverity,
  description: "",
  witnesses: "",
};

export function BlotterManagement({ blotters }: { blotters: BlotterRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<BlotterRow | null>(null);
  const [updating, setUpdating] = useState(false);

  const filtered = blotters.filter((b) =>
    [b.case_no, b.complainant_name, b.respondent_name, b.incident_type]
      .join(" ")
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("blotters").insert({
      ...form,
      incident_datetime: new Date(form.incident_datetime).toISOString(),
      witnesses: form.witnesses || null,
    });
    setSaving(false);
    if (!error) {
      setForm(EMPTY_FORM);
      setShowForm(false);
      router.refresh();
    }
  }

  async function updateStatus(status: BlotterStatus) {
    if (!selected) return;
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("blotters")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", selected.id);
    setUpdating(false);
    if (!error) {
      setSelected({ ...selected, status });
      router.refresh();
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex flex-col gap-3 rounded-card border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-900/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blotter records..."
              className="w-full rounded-md border border-black/10 py-2 pl-9 pr-3 text-sm outline-none focus:border-maroon-400"
            />
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> File New Blotter
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-card border border-black/5 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-cream-50 text-left text-xs text-maroon-900/50">
                <th className="p-3 font-medium">Case No.</th>
                <th className="p-3 font-medium">Parties</th>
                <th className="p-3 font-medium">Incident Type</th>
                <th className="p-3 font-medium">Date Filed</th>
                <th className="p-3 font-medium">Severity</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-maroon-900/50">
                    No blotter records found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className={cn(
                      "cursor-pointer border-b border-black/5 last:border-0 hover:bg-cream-50",
                      selected?.id === b.id && "bg-gold-100/40"
                    )}
                  >
                    <td className="p-3 font-mono text-xs text-maroon-900">{b.case_no}</td>
                    <td className="p-3 text-maroon-900/80">
                      {b.complainant_name} <span className="text-maroon-900/40">vs.</span> {b.respondent_name}
                    </td>
                    <td className="p-3 text-maroon-900/70">{b.incident_type}</td>
                    <td className="p-3 text-maroon-900/70">
                      {new Date(b.incident_datetime).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })}
                    </td>
                    <td className="p-3">
                      <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", SEVERITY_STYLES[b.severity])}>
                        {b.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", STATUS_STYLES[b.status])}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="h-fit rounded-card border border-black/5 bg-white p-5 shadow-sm">
        {!selected ? (
          <p className="py-10 text-center text-sm text-maroon-900/50">Select a blotter to view and process it.</p>
        ) : (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900">{selected.case_no}</p>
              <button onClick={() => setSelected(null)}>
                <X className="h-4 w-4 text-maroon-900/40" />
              </button>
            </div>
            <span className={cn("mb-4 inline-block rounded-full px-2 py-1 text-xs font-semibold", SEVERITY_STYLES[selected.severity])}>
              {selected.severity} Severity
            </span>

            <dl className="space-y-2 text-sm">
              <Row label="Complainant" value={selected.complainant_name} />
              <Row label="Respondent" value={selected.respondent_name} />
              <Row label="Incident Type" value={selected.incident_type} />
              <Row label="Location" value={selected.location} />
              <Row
                label="Date & Time"
                value={new Date(selected.incident_datetime).toLocaleString("en-PH", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              />
              {selected.witnesses && <Row label="Witnesses" value={selected.witnesses} />}
            </dl>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-maroon-900/50">Description</p>
              <p className="mt-1 text-sm text-maroon-900/80">{selected.description}</p>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-maroon-900/50">Status</p>
              <span className={cn("inline-block rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_STYLES[selected.status])}>
                {selected.status}
              </span>

              {selected.status !== "Resolved" && (
                <div className="flex flex-col gap-2 pt-2">
                  {selected.status === "Open" && (
                    <Button size="sm" onClick={() => updateStatus("Under Mediation")} disabled={updating}>
                      <ArrowRight className="h-4 w-4" /> Move to Under Mediation
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-bamboo-green-500 text-bamboo-green-600 hover:bg-bamboo-green-100"
                    onClick={() => updateStatus("Resolved")}
                    disabled={updating}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark Resolved
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-card bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-display text-lg font-semibold text-maroon-900">New Blotter Entry</p>
                <p className="text-xs text-maroon-900/50">Fields marked with * are required.</p>
              </div>
              <button onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 text-maroon-900/50" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <TextInput label="Complainant *" value={form.complainant_name} onChange={(v) => setForm((f) => ({ ...f, complainant_name: v }))} />
              <TextInput label="Respondent *" value={form.respondent_name} onChange={(v) => setForm((f) => ({ ...f, respondent_name: v }))} />
              <TextInput label="Incident Type *" value={form.incident_type} onChange={(v) => setForm((f) => ({ ...f, incident_type: v }))} />
              <TextInput
                label="Date & Time *"
                type="datetime-local"
                value={form.incident_datetime}
                onChange={(v) => setForm((f) => ({ ...f, incident_datetime: v }))}
              />
              <TextInput label="Location *" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} />
              <div>
                <label className="text-xs text-maroon-900/60">Severity *</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as BlotterSeverity }))}
                  className="mt-1 w-full rounded-md border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-maroon-400"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-maroon-900/60">Incident Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Provide a clear and detailed description of the incident, including what happened, when it happened, and any relevant circumstances."
                  className="mt-1 w-full rounded-md border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-maroon-400"
                />
              </div>

              <div className="sm:col-span-2">
                <TextInput
                  label="Witnesses (Optional)"
                  value={form.witnesses}
                  onChange={(v) => setForm((f) => ({ ...f, witnesses: v }))}
                  placeholder="Enter witness names, comma separated"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.complainant_name ||
                  !form.respondent_name ||
                  !form.incident_type ||
                  !form.incident_datetime ||
                  !form.location ||
                  !form.description
                }
              >
                {saving ? "Saving..." : "Save Blotter Entry"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-maroon-900/50">{label}</dt>
      <dd className="text-right font-medium text-maroon-900">{value}</dd>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-maroon-900/60">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-maroon-400"
      />
    </div>
  );
}
