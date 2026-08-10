"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Eye, Pencil, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-bamboo-green-100 text-bamboo-green-600",
  inactive: "bg-black/5 text-maroon-900/50",
  pending: "bg-gold-100 text-gold-600",
};

export function ResidentManagement({ residents }: { residents: Profile[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile_number: "",
    house_lot_no: "",
    street: "",
    purok_zone: "",
    household_no: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ tempPassword: string } | { error: string } | null>(null);

  const [viewing, setViewing] = useState<Profile | null>(null);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState({
    mobile_number: "",
    house_lot_no: "",
    street: "",
    purok_zone: "",
    household_no: "",
    status: "active" as Profile["status"],
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editNotice, setEditNotice] = useState<string | null>(null);

  const filtered = residents.filter((r) =>
    r.full_name.toLowerCase().includes(query.trim().toLowerCase())
  );

  async function handleAddResident() {
    setSubmitting(true);
    setResult(null);
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke("admin-create-resident", {
      body: form,
    });
    setSubmitting(false);

    if (error || data?.error) {
      setResult({ error: data?.error ?? error?.message ?? "Failed to create resident" });
      return;
    }

    setResult({ tempPassword: data.temp_password });
    router.refresh();
  }

  function openEdit(r: Profile) {
    setEditing(r);
    setEditForm({
      mobile_number: r.mobile_number ?? "",
      house_lot_no: r.house_lot_no ?? "",
      street: r.street ?? "",
      purok_zone: r.purok_zone ?? "",
      household_no: r.household_no ?? "",
      status: r.status,
    });
    setEditNotice(null);
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setEditSaving(true);
    setEditNotice(null);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update(editForm).eq("id", editing.id);
    setEditSaving(false);
    if (error) {
      setEditNotice(error.message);
    } else {
      setEditing(null);
      router.refresh();
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-card border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-900/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="w-full rounded-md border border-black/10 py-2 pl-9 pr-3 text-sm outline-none focus:border-maroon-400"
          />
        </div>
        <span className="text-sm text-maroon-900/60">{filtered.length} residents</span>
        <Button
          size="sm"
          onClick={() => {
            setShowAddForm(true);
            setResult(null);
          }}
        >
          <Plus className="h-4 w-4" /> Add Resident
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-card border border-black/5 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-cream-50 text-left text-xs text-maroon-900/50">
              <th className="p-3 font-medium">Full Name</th>
              <th className="p-3 font-medium">Address</th>
              <th className="p-3 font-medium">Household No.</th>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-maroon-900/50">
                  No residents found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="border-b border-black/5 last:border-0">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon-100 text-xs font-semibold text-maroon-500">
                        {r.full_name.charAt(0)}
                      </span>
                      {r.full_name}
                    </div>
                  </td>
                  <td className="p-3 text-maroon-900/70">
                    {[r.house_lot_no, r.street, r.purok_zone].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="p-3 text-maroon-900/70">{r.household_no ?? "—"}</td>
                  <td className="p-3 text-maroon-900/70">{r.mobile_number ?? "—"}</td>
                  <td className="p-3">
                    <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", STATUS_STYLES[r.status])}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => setViewing(r)} className="text-maroon-900/40 hover:text-maroon-500">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => openEdit(r)} className="text-maroon-900/40 hover:text-maroon-500">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900">Add Resident</p>
              <button onClick={() => setShowAddForm(false)}>
                <X className="h-4 w-4 text-maroon-900/50" />
              </button>
            </div>

            {result && "tempPassword" in result ? (
              <div className="rounded-md bg-bamboo-green-100 p-4 text-sm text-bamboo-green-700">
                <p className="font-semibold">Resident account created.</p>
                <p className="mt-1">
                  Temporary password: <code className="rounded bg-white px-1.5 py-0.5">{result.tempPassword}</code>
                </p>
                <p className="mt-1 text-xs text-bamboo-green-600">
                  Share this with the resident directly — it won&apos;t be shown again. They can change it after signing in.
                </p>
                <Button size="sm" className="mt-3" onClick={() => setShowAddForm(false)}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Full Name" value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} />
                <Input label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
                <Input label="Mobile Number" value={form.mobile_number} onChange={(v) => setForm((f) => ({ ...f, mobile_number: v }))} />
                <Input label="Household No." value={form.household_no} onChange={(v) => setForm((f) => ({ ...f, household_no: v }))} />
                <Input label="House/Lot No." value={form.house_lot_no} onChange={(v) => setForm((f) => ({ ...f, house_lot_no: v }))} />
                <Input label="Street" value={form.street} onChange={(v) => setForm((f) => ({ ...f, street: v }))} />
                <Input label="Purok/Zone" value={form.purok_zone} onChange={(v) => setForm((f) => ({ ...f, purok_zone: v }))} />

                {result && "error" in result && (
                  <p className="col-span-2 rounded-md bg-festival-red-100 px-3 py-2 text-sm text-festival-red-600">
                    {result.error}
                  </p>
                )}

                <div className="col-span-2 mt-2 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddResident} disabled={submitting || !form.full_name || !form.email}>
                    {submitting ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-card bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900">Resident Details</p>
              <button onClick={() => setViewing(null)}>
                <X className="h-4 w-4 text-maroon-900/50" />
              </button>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-100 text-lg font-semibold text-maroon-500">
                {viewing.full_name.charAt(0)}
              </span>
              <div>
                <p className="font-medium text-maroon-900">{viewing.full_name}</p>
                <p className="text-xs text-maroon-900/50">{viewing.email}</p>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <DetailRow label="Mobile" value={viewing.mobile_number} />
              <DetailRow label="Household No." value={viewing.household_no} />
              <DetailRow
                label="Address"
                value={[viewing.house_lot_no, viewing.street, viewing.purok_zone].filter(Boolean).join(", ")}
              />
              <DetailRow label="Date of Birth" value={viewing.date_of_birth} />
              <DetailRow label="Sex" value={viewing.sex} />
              <DetailRow label="Civil Status" value={viewing.civil_status} />
              <DetailRow label="Status" value={viewing.status.charAt(0).toUpperCase() + viewing.status.slice(1)} />
            </dl>
            <Button className="mt-5 w-full" onClick={() => setViewing(null)}>
              Close
            </Button>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900">Edit {editing.full_name}</p>
              <button onClick={() => setEditing(null)}>
                <X className="h-4 w-4 text-maroon-900/50" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Mobile Number" value={editForm.mobile_number} onChange={(v) => setEditForm((f) => ({ ...f, mobile_number: v }))} />
              <Input label="Household No." value={editForm.household_no} onChange={(v) => setEditForm((f) => ({ ...f, household_no: v }))} />
              <Input label="House/Lot No." value={editForm.house_lot_no} onChange={(v) => setEditForm((f) => ({ ...f, house_lot_no: v }))} />
              <Input label="Street" value={editForm.street} onChange={(v) => setEditForm((f) => ({ ...f, street: v }))} />
              <Input label="Purok/Zone" value={editForm.purok_zone} onChange={(v) => setEditForm((f) => ({ ...f, purok_zone: v }))} />
              <div>
                <label className="text-xs text-maroon-900/60">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as Profile["status"] }))}
                  className="mt-1 w-full rounded-md border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-maroon-400"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {editNotice && (
              <p className="mt-3 rounded-md bg-festival-red-100 px-3 py-2 text-xs text-festival-red-600">{editNotice}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={editSaving}>
                {editSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-maroon-900/50">{label}</dt>
      <dd className="text-right font-medium text-maroon-900">{value || "—"}</dd>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-maroon-900/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-maroon-400"
      />
    </div>
  );
}
