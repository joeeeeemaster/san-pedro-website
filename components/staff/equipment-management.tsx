"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { EquipmentRow, EquipmentRentalRow, RentalStatus } from "@/lib/supabase/types";

const STATUS_STYLES: Record<string, string> = {
  Available: "bg-bamboo-green-100 text-bamboo-green-600",
  Rented: "bg-gold-100 text-gold-600",
  "Under Maintenance": "bg-festival-red-100 text-festival-red-600",
  Reserved: "bg-mayon-blue-100 text-mayon-blue-600",
  Released: "bg-bamboo-green-100 text-bamboo-green-600",
  Returned: "bg-black/5 text-maroon-900/50",
  "Due Today": "bg-gold-100 text-gold-600",
};

const EMPTY_RENTAL = {
  equipment_id: "",
  borrower_name: "",
  contact_number: "",
  date_out: "",
  return_date: "",
  quantity: 1,
};

export function EquipmentManagement({
  equipment,
  rentals,
}: {
  equipment: EquipmentRow[];
  rentals: (EquipmentRentalRow & { equipment: { name: string } | null })[];
}) {
  const router = useRouter();
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [form, setForm] = useState(EMPTY_RENTAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddRental() {
    const item = equipment.find((e) => e.id === form.equipment_id);
    if (!item) return;
    if (form.quantity > item.available_quantity) {
      setError(`Only ${item.available_quantity} available.`);
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: insertError } = await supabase.from("equipment_rentals").insert({
      equipment_id: form.equipment_id,
      borrower_name: form.borrower_name,
      contact_number: form.contact_number || null,
      date_out: new Date(form.date_out).toISOString(),
      return_date: new Date(form.return_date).toISOString(),
      quantity: form.quantity,
      status: "Reserved",
    });

    if (insertError) {
      setSaving(false);
      setError(insertError.message);
      return;
    }

    await supabase
      .from("equipment")
      .update({ available_quantity: item.available_quantity - form.quantity })
      .eq("id", item.id);

    setSaving(false);
    setForm(EMPTY_RENTAL);
    setShowRentalForm(false);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-semibold text-maroon-900">Equipment Inventory</p>
        <Button size="sm" onClick={() => setShowRentalForm(true)}>
          <Plus className="h-4 w-4" /> New Rental
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {equipment.map((item) => (
          <div key={item.id} className="rounded-card border border-black/5 bg-white p-4 shadow-sm">
            <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-md bg-cream-100">
              {item.photo_url && <Image src={item.photo_url} alt={item.name} fill className="object-cover" />}
            </div>
            <p className="text-sm font-semibold text-maroon-900">{item.name}</p>
            <div className="mt-1 flex justify-between text-xs text-maroon-900/60">
              <span>Total</span>
              <span className="font-medium text-maroon-900">{item.total_quantity}</span>
            </div>
            <div className="flex justify-between text-xs text-maroon-900/60">
              <span>Available</span>
              <span className="font-medium text-maroon-900">{item.available_quantity}</span>
            </div>
            <span className={cn("mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_STYLES[item.status])}>
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <p className="font-display mb-3 mt-6 text-lg font-semibold text-maroon-900">Rental Schedule</p>
      <div className="overflow-hidden rounded-card border border-black/5 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-cream-50 text-left text-xs text-maroon-900/50">
              <th className="p-3 font-medium">Equipment</th>
              <th className="p-3 font-medium">Borrower</th>
              <th className="p-3 font-medium">Contact</th>
              <th className="p-3 font-medium">Date Out</th>
              <th className="p-3 font-medium">Return Date</th>
              <th className="p-3 font-medium">Qty</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rentals.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-maroon-900/50">
                  No rentals scheduled.
                </td>
              </tr>
            ) : (
              rentals.map((r) => (
                <tr key={r.id} className="border-b border-black/5 last:border-0">
                  <td className="p-3 text-maroon-900">{r.equipment?.name ?? "—"}</td>
                  <td className="p-3 text-maroon-900/80">{r.borrower_name}</td>
                  <td className="p-3 text-maroon-900/70">{r.contact_number ?? "—"}</td>
                  <td className="p-3 text-maroon-900/70">
                    {new Date(r.date_out).toLocaleDateString("en-PH", { month: "short", day: "2-digit" })}
                  </td>
                  <td className="p-3 text-maroon-900/70">
                    {new Date(r.return_date).toLocaleDateString("en-PH", { month: "short", day: "2-digit" })}
                  </td>
                  <td className="p-3 text-maroon-900/70">{r.quantity}</td>
                  <td className="p-3">
                    <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", STATUS_STYLES[r.status])}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showRentalForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-card bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900">New Rental</p>
              <button onClick={() => setShowRentalForm(false)}>
                <X className="h-4 w-4 text-maroon-900/50" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs text-maroon-900/60">Equipment</label>
                <select
                  value={form.equipment_id}
                  onChange={(e) => setForm((f) => ({ ...f, equipment_id: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-black/10 px-2.5 py-1.5 text-sm outline-none focus:border-maroon-400"
                >
                  <option value="">Select equipment...</option>
                  {equipment.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.available_quantity} available)
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Borrower Name" value={form.borrower_name} onChange={(v) => setForm((f) => ({ ...f, borrower_name: v }))} />
              <Input label="Contact Number" value={form.contact_number} onChange={(v) => setForm((f) => ({ ...f, contact_number: v }))} />
              <Input
                label="Date Out"
                type="datetime-local"
                value={form.date_out}
                onChange={(v) => setForm((f) => ({ ...f, date_out: v }))}
              />
              <Input
                label="Return Date"
                type="datetime-local"
                value={form.return_date}
                onChange={(v) => setForm((f) => ({ ...f, return_date: v }))}
              />
              <Input
                label="Quantity"
                type="number"
                value={String(form.quantity)}
                onChange={(v) => setForm((f) => ({ ...f, quantity: Number(v) || 1 }))}
              />
            </div>

            {error && <p className="mt-3 rounded-md bg-festival-red-100 px-3 py-2 text-xs text-festival-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRentalForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddRental}
                disabled={saving || !form.equipment_id || !form.borrower_name || !form.date_out || !form.return_date}
              >
                {saving ? "Saving..." : "Save Rental"}
              </Button>
            </div>
          </div>
        </div>
      )}
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
