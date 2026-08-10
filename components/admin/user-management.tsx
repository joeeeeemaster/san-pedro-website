"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, KeyRound, Ban, CheckCircle2, Plus, Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/lib/supabase/types";

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-maroon-100 text-maroon-600",
  staff: "bg-mayon-blue-100 text-mayon-blue-600",
  resident: "bg-bamboo-green-100 text-bamboo-green-600",
};

const TABS: { key: UserRole | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "admin", label: "Admin" },
  { key: "staff", label: "Staff" },
  { key: "resident", label: "Resident" },
];

const STAFF_CAP = 2;
const KAGAWAD_CAP = 7;

const EMPTY_ADD_FORM = {
  addRole: "resident" as "resident" | "staff" | "kagawad",
  full_name: "",
  email: "",
  mobile_number: "",
  house_lot_no: "",
  street: "",
  purok_zone: "",
  household_no: "",
};

export function UserManagement({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<UserRole | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole>("resident");
  const [pendingActive, setPendingActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [addPhoto, setAddPhoto] = useState<File | null>(null);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addResult, setAddResult] = useState<{ tempPassword: string } | { error: string } | null>(null);

  const counts: Record<string, number> = { all: users.length };
  for (const r of ["admin", "staff", "resident"]) counts[r] = users.filter((u) => u.role === r).length;
  const staffCount = users.filter((u) => u.role === "staff" && u.position !== "Kagawad").length;
  const kagawadCount = users.filter((u) => u.role === "staff" && u.position === "Kagawad").length;

  const filtered = users.filter((u) => {
    const matchesTab = tab === "all" || u.role === tab;
    const matchesQuery =
      u.full_name.toLowerCase().includes(query.trim().toLowerCase()) ||
      u.email.toLowerCase().includes(query.trim().toLowerCase());
    return matchesTab && matchesQuery;
  });

  function openUser(u: Profile) {
    setSelected(u);
    setPendingRole(u.role);
    setPendingActive(u.status === "active");
    setNotice(null);
    setShowDetails(false);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: pendingRole, status: pendingActive ? "active" : "inactive" })
      .eq("id", selected.id);
    setSaving(false);
    if (error) {
      setNotice(error.message);
    } else {
      setNotice("Saved.");
      router.refresh();
    }
  }

  async function handleResetPassword() {
    if (!selected) return;
    setSaving(true);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(selected.email);
    setSaving(false);
    setNotice(error ? error.message : `Password reset email sent to ${selected.email}.`);
  }

  async function handleAddUser() {
    setAddSubmitting(true);
    setAddResult(null);
    const supabase = createClient();

    const payload = {
      email: addForm.email,
      full_name: addForm.full_name,
      mobile_number: addForm.mobile_number,
      house_lot_no: addForm.house_lot_no,
      street: addForm.street,
      purok_zone: addForm.purok_zone,
      household_no: addForm.household_no,
      role: addForm.addRole === "resident" ? "resident" : "staff",
      position: addForm.addRole === "kagawad" ? "Kagawad" : addForm.addRole === "staff" ? "Staff" : null,
    };

    const { data, error } = await supabase.functions.invoke("admin-create-resident", { body: payload });

    if (error || data?.error) {
      setAddSubmitting(false);
      setAddResult({ error: data?.error ?? error?.message ?? "Failed to create account" });
      return;
    }

    // Photo is optional and uploaded as a follow-up now that we have the new user's id.
    if (addPhoto) {
      const ext = addPhoto.name.split(".").pop() ?? "jpg";
      const path = `${data.user_id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, addPhoto, { upsert: true });
      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(path);
        await supabase.from("profiles").update({ avatar_url: `${publicUrl}?t=${Date.now()}` }).eq("id", data.user_id);
      }
    }

    setAddSubmitting(false);
    setAddResult({ tempPassword: data.temp_password });
    router.refresh();
  }

  function closeAddModal() {
    setShowAddModal(false);
    setAddForm(EMPTY_ADD_FORM);
    setAddPhoto(null);
    setAddResult(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="flex flex-col gap-3 rounded-card border border-black/5 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  tab === t.key ? "bg-maroon-500 text-white" : "bg-cream-100 text-maroon-900/70 hover:bg-cream-100/70"
                )}
              >
                {t.label} {counts[t.key] ?? 0}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400 sm:ml-auto sm:w-56"
          />
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-card border border-black/5 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-cream-50 text-left text-xs text-maroon-900/50">
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-maroon-900/50">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => openUser(u)}
                    className={cn(
                      "cursor-pointer border-b border-black/5 last:border-0 hover:bg-cream-50",
                      selected?.id === u.id && "bg-gold-100/40"
                    )}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-maroon-100 text-xs font-semibold text-maroon-500">
                          {u.avatar_url ? (
                            <Image src={u.avatar_url} alt={u.full_name} fill className="object-cover" />
                          ) : (
                            u.full_name.charAt(0) || "?"
                          )}
                        </span>
                        {u.full_name || "(no name)"}
                        {u.id === currentUserId && (
                          <span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] text-maroon-900/50">You</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-maroon-900/70">{u.email}</td>
                    <td className="p-3">
                      <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", ROLE_STYLES[u.role])}>
                        {u.position || (u.role.charAt(0).toUpperCase() + u.role.slice(1))}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-semibold",
                          u.status === "active" ? "bg-bamboo-green-100 text-bamboo-green-600" : "bg-black/5 text-maroon-900/50"
                        )}
                      >
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-3 text-maroon-900/70">
                      {new Date(u.created_at).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })}
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
          <p className="py-10 text-center text-sm text-maroon-900/50">Select a user to manage their account.</p>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900">Manage Account</p>
              <button onClick={() => setSelected(null)}>
                <X className="h-4 w-4 text-maroon-900/40" />
              </button>
            </div>

            <div className="mb-3 flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-maroon-100 text-sm font-semibold text-maroon-500">
                {selected.avatar_url ? (
                  <Image src={selected.avatar_url} alt={selected.full_name} fill className="object-cover" />
                ) : (
                  selected.full_name.charAt(0) || "?"
                )}
              </span>
              <div>
                <p className="text-sm font-semibold text-maroon-900">{selected.full_name || "(no name)"}</p>
                <p className="text-xs text-maroon-900/50">{selected.email}</p>
              </div>
            </div>

            <button
              onClick={() => setShowDetails((v) => !v)}
              className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gold-600 hover:underline"
            >
              <Eye className="h-3.5 w-3.5" /> {showDetails ? "Hide Details" : "View Details"}
            </button>

            {showDetails && (
              <dl className="mb-4 space-y-1.5 rounded-md bg-cream-50 p-3 text-xs">
                <DetailRow label="Mobile" value={selected.mobile_number} />
                <DetailRow label="Household No." value={selected.household_no} />
                <DetailRow
                  label="Address"
                  value={[selected.house_lot_no, selected.street, selected.purok_zone].filter(Boolean).join(", ")}
                />
                <DetailRow label="Date of Birth" value={selected.date_of_birth} />
                <DetailRow label="Sex" value={selected.sex} />
                <DetailRow label="Civil Status" value={selected.civil_status} />
                <DetailRow
                  label="Date Created"
                  value={new Date(selected.created_at).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })}
                />
              </dl>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-maroon-900">Role</label>
                <select
                  value={pendingRole}
                  onChange={(e) => setPendingRole(e.target.value as UserRole)}
                  disabled={selected.id === currentUserId}
                  className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400 disabled:bg-cream-50"
                >
                  <option value="resident">Resident</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                {selected.id === currentUserId && (
                  <p className="mt-1 text-xs text-maroon-900/40">You can&apos;t change your own role here.</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-maroon-900">Account Status</label>
                <button
                  onClick={() => setPendingActive((v) => !v)}
                  disabled={selected.id === currentUserId}
                  className={cn(
                    "relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50",
                    pendingActive ? "bg-bamboo-green-500" : "bg-black/20"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                      pendingActive ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              {notice && (
                <p className="flex items-center gap-1.5 rounded-md bg-cream-50 px-3 py-2 text-xs text-maroon-900/70">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" /> {notice}
                </p>
              )}

              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              <Button variant="outline" className="w-full" onClick={handleResetPassword} disabled={saving}>
                <KeyRound className="h-4 w-4" /> Send Password Reset Email
              </Button>

              {selected.id !== currentUserId && (
                <Button
                  variant="outline"
                  className="w-full border-festival-red-500 text-festival-red-500 hover:bg-festival-red-100"
                  onClick={() => setPendingActive(false)}
                  disabled={saving}
                >
                  <Ban className="h-4 w-4" /> Deactivate Account
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900">Add User</p>
              <button onClick={closeAddModal}>
                <X className="h-4 w-4 text-maroon-900/50" />
              </button>
            </div>

            {addResult && "tempPassword" in addResult ? (
              <div className="rounded-md bg-bamboo-green-100 p-4 text-sm text-bamboo-green-700">
                <p className="font-semibold">Account created.</p>
                <p className="mt-1">
                  Temporary password: <code className="rounded bg-white px-1.5 py-0.5">{addResult.tempPassword}</code>
                </p>
                <p className="mt-1 text-xs text-bamboo-green-600">
                  Share this with them directly — it won&apos;t be shown again.
                </p>
                <Button size="sm" className="mt-3" onClick={closeAddModal}>
                  Done
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-maroon-900/60">Account Type</label>
                  <div className="mt-1 grid grid-cols-3 gap-2">
                    <RoleOption
                      label="Resident"
                      active={addForm.addRole === "resident"}
                      onClick={() => setAddForm((f) => ({ ...f, addRole: "resident" }))}
                    />
                    <RoleOption
                      label={`Staff (${staffCount}/${STAFF_CAP})`}
                      active={addForm.addRole === "staff"}
                      disabled={staffCount >= STAFF_CAP}
                      onClick={() => setAddForm((f) => ({ ...f, addRole: "staff" }))}
                    />
                    <RoleOption
                      label={`Kagawad (${kagawadCount}/${KAGAWAD_CAP})`}
                      active={addForm.addRole === "kagawad"}
                      disabled={kagawadCount >= KAGAWAD_CAP}
                      onClick={() => setAddForm((f) => ({ ...f, addRole: "kagawad" }))}
                    />
                  </div>
                  {addForm.addRole === "staff" && staffCount >= STAFF_CAP && (
                    <p className="mt-1 text-xs text-festival-red-600">Staff limit reached ({STAFF_CAP}).</p>
                  )}
                  {addForm.addRole === "kagawad" && kagawadCount >= KAGAWAD_CAP && (
                    <p className="mt-1 text-xs text-festival-red-600">Kagawad limit reached ({KAGAWAD_CAP}).</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-maroon-100 text-xl font-semibold text-maroon-500">
                    {addPhoto ? (
                      <Image src={URL.createObjectURL(addPhoto)} alt="" width={56} height={56} className="h-full w-full object-cover" />
                    ) : (
                      "?"
                    )}
                  </div>
                  <label className="cursor-pointer text-sm font-medium text-gold-600 hover:underline">
                    {addPhoto ? "Change Photo" : "Upload Photo (optional)"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setAddPhoto(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Full Name" value={addForm.full_name} onChange={(v) => setAddForm((f) => ({ ...f, full_name: v }))} />
                  <Input label="Email" type="email" value={addForm.email} onChange={(v) => setAddForm((f) => ({ ...f, email: v }))} />
                  <Input label="Mobile Number" value={addForm.mobile_number} onChange={(v) => setAddForm((f) => ({ ...f, mobile_number: v }))} />
                  {addForm.addRole === "resident" && (
                    <>
                      <Input label="Household No." value={addForm.household_no} onChange={(v) => setAddForm((f) => ({ ...f, household_no: v }))} />
                      <Input label="House/Lot No." value={addForm.house_lot_no} onChange={(v) => setAddForm((f) => ({ ...f, house_lot_no: v }))} />
                      <Input label="Street" value={addForm.street} onChange={(v) => setAddForm((f) => ({ ...f, street: v }))} />
                      <Input label="Purok/Zone" value={addForm.purok_zone} onChange={(v) => setAddForm((f) => ({ ...f, purok_zone: v }))} />
                    </>
                  )}
                </div>

                {addResult && "error" in addResult && (
                  <p className="rounded-md bg-festival-red-100 px-3 py-2 text-sm text-festival-red-600">{addResult.error}</p>
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={closeAddModal}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={
                      addSubmitting ||
                      !addForm.full_name ||
                      !addForm.email ||
                      (addForm.addRole === "staff" && staffCount >= STAFF_CAP) ||
                      (addForm.addRole === "kagawad" && kagawadCount >= KAGAWAD_CAP)
                    }
                  >
                    {addSubmitting ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </div>
            )}
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

function RoleOption({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-md border-2 px-2 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active ? "border-gold-500 bg-gold-100/50 text-maroon-900" : "border-black/10 text-maroon-900/70"
      )}
    >
      {label}
    </button>
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
