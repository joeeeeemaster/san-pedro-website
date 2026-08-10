"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Pencil, Plus, Trash2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Profile, HouseholdMemberRow } from "@/lib/supabase/types";

const TRACKED_FIELDS: (keyof Profile)[] = [
  "date_of_birth",
  "sex",
  "civil_status",
  "house_lot_no",
  "street",
  "purok_zone",
  "mobile_number",
  "avatar_url",
];

function completionPercent(profile: Profile) {
  const filled = TRACKED_FIELDS.filter((f) => Boolean(profile[f])).length;
  return Math.round((filled / TRACKED_FIELDS.length) * 100);
}

export function ProfileForm({
  userId,
  initialProfile,
  initialHousehold,
}: {
  userId: string;
  initialProfile: Profile;
  initialHousehold: HouseholdMemberRow[];
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [household, setHousehold] = useState(initialHousehold);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ full_name: "", relationship: "", age: "" });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const residentCode = `RSD-${userId.slice(0, 8).toUpperCase()}`;

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust so the new photo shows immediately instead of the browser's cached old one.
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: bustedUrl })
        .eq("id", userId);
      if (updateError) throw updateError;

      setProfile((p) => ({ ...p, avatar_url: bustedUrl }));
      router.refresh();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        date_of_birth: profile.date_of_birth,
        sex: profile.sex,
        civil_status: profile.civil_status,
        house_lot_no: profile.house_lot_no,
        street: profile.street,
        purok_zone: profile.purok_zone,
        mobile_number: profile.mobile_number,
      })
      .eq("id", userId);
    setSaving(false);
    if (!error) {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleAddMember() {
    if (!newMember.full_name || !newMember.relationship) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("household_members")
      .insert({
        resident_id: userId,
        full_name: newMember.full_name,
        relationship: newMember.relationship,
        age: newMember.age ? Number(newMember.age) : null,
      })
      .select()
      .single();
    if (!error && data) {
      setHousehold((prev) => [...prev, data as HouseholdMemberRow]);
      setNewMember({ full_name: "", relationship: "", age: "" });
      setAddingMember(false);
    }
  }

  async function handleRemoveMember(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("household_members").delete().eq("id", id);
    if (!error) setHousehold((prev) => prev.filter((m) => m.id !== id));
  }

  const percent = completionPercent(profile);

  return (
    <div className="grid gap-5 md:grid-cols-[280px_1fr]">
      <Card>
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="relative">
            <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-maroon-100 text-3xl font-semibold text-maroon-500">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
              ) : (
                profile.full_name.charAt(0)
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 text-maroon-900 dark:text-cream-50 disabled:opacity-60"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarSelect}
              className="hidden"
            />
            {uploadingAvatar && (
              <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-maroon-900/50 dark:text-cream-50/50">
                Uploading...
              </p>
            )}
          </div>
          {avatarError && <p className="mt-1 text-xs text-festival-red-600">{avatarError}</p>}
          <p className="font-display mt-3 text-lg font-semibold text-maroon-900 dark:text-cream-50">
            {profile.full_name}
          </p>
          <p className="text-xs text-maroon-900/50 dark:text-cream-50/50">{residentCode}</p>
          <span className="mt-2 rounded-full bg-bamboo-green-100 px-3 py-1 text-xs font-semibold text-bamboo-green-600">
            Verified Resident
          </span>
          {profile.household_no && (
            <span className="mt-2 rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-600">
              Household No. {profile.household_no}
            </span>
          )}

          <div className="mt-5 w-full">
            <div className="flex items-center justify-between text-xs">
              <span className="text-maroon-900/60 dark:text-cream-50/60">Account Completion</span>
              <span className="font-semibold text-bamboo-green-600">{percent}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-cream-100 dark:bg-maroon-900">
              <div
                className="h-2 rounded-full bg-bamboo-green-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-maroon-900/50 dark:text-cream-50/50">
              Keep your profile up to date to access all barangay services.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">Personal Information</p>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-sm font-medium text-gold-600 hover:underline"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label="Full Name"
                value={profile.full_name}
                editing={editing}
                onChange={(v) => setProfile((p) => ({ ...p, full_name: v }))}
              />
              <ProfileField
                label="Date of Birth"
                type="date"
                value={profile.date_of_birth ?? ""}
                editing={editing}
                onChange={(v) => setProfile((p) => ({ ...p, date_of_birth: v }))}
              />
              <ProfileSelect
                label="Sex"
                value={profile.sex ?? ""}
                options={["Male", "Female"]}
                editing={editing}
                onChange={(v) => setProfile((p) => ({ ...p, sex: v as Profile["sex"] }))}
              />
              <ProfileField
                label="Civil Status"
                value={profile.civil_status ?? ""}
                editing={editing}
                onChange={(v) => setProfile((p) => ({ ...p, civil_status: v }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">Address</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label="House/Lot No."
                value={profile.house_lot_no ?? ""}
                editing={editing}
                onChange={(v) => setProfile((p) => ({ ...p, house_lot_no: v }))}
              />
              <ProfileField
                label="Street"
                value={profile.street ?? ""}
                editing={editing}
                onChange={(v) => setProfile((p) => ({ ...p, street: v }))}
              />
              <ProfileField
                label="Purok/Zone"
                value={profile.purok_zone ?? ""}
                editing={editing}
                onChange={(v) => setProfile((p) => ({ ...p, purok_zone: v }))}
              />
              <ProfileField label="Barangay" value="San Pedro" editing={false} onChange={() => {}} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">Contact Details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label="Mobile Number"
                value={profile.mobile_number ?? ""}
                editing={editing}
                onChange={(v) => setProfile((p) => ({ ...p, mobile_number: v }))}
              />
              <ProfileField label="Email Address" value={profile.email} editing={false} onChange={() => {}} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-maroon-900 dark:text-cream-50">Household Members</p>
              <button
                onClick={() => setAddingMember((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium text-gold-600 hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Member
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 text-left text-xs text-maroon-900/50 dark:text-cream-50/50">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Relationship</th>
                  <th className="pb-2 font-medium">Age</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {household.map((m) => (
                  <tr key={m.id} className="border-b border-black/5 dark:border-white/10 last:border-0">
                    <td className="py-2 text-maroon-900 dark:text-cream-50">{m.full_name}</td>
                    <td className="py-2 text-maroon-900/70 dark:text-cream-50/70">{m.relationship}</td>
                    <td className="py-2 text-maroon-900/70 dark:text-cream-50/70">{m.age ?? "—"}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => handleRemoveMember(m.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-maroon-900/30 hover:text-festival-red-500" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {addingMember && (
              <div className="mt-3 grid gap-2 rounded-md bg-cream-50 dark:bg-maroon-900 p-3 sm:grid-cols-4">
                <input
                  placeholder="Full name"
                  value={newMember.full_name}
                  onChange={(e) => setNewMember((m) => ({ ...m, full_name: e.target.value }))}
                  className="rounded-md border border-black/10 dark:border-white/20 px-2 py-1.5 text-sm outline-none focus:border-maroon-400"
                />
                <input
                  placeholder="Relationship"
                  value={newMember.relationship}
                  onChange={(e) => setNewMember((m) => ({ ...m, relationship: e.target.value }))}
                  className="rounded-md border border-black/10 dark:border-white/20 px-2 py-1.5 text-sm outline-none focus:border-maroon-400"
                />
                <input
                  placeholder="Age"
                  type="number"
                  value={newMember.age}
                  onChange={(e) => setNewMember((m) => ({ ...m, age: e.target.value }))}
                  className="rounded-md border border-black/10 dark:border-white/20 px-2 py-1.5 text-sm outline-none focus:border-maroon-400"
                />
                <Button size="sm" onClick={handleAddMember}>
                  Save
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {editing && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setProfile(initialProfile);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  editing,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  editing: boolean;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-maroon-900/50 dark:text-cream-50/50">{label}</p>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/10 dark:border-white/20 px-2 py-1.5 text-sm outline-none focus:border-maroon-400"
        />
      ) : (
        <p className="mt-0.5 text-sm font-medium text-maroon-900 dark:text-cream-50">{value || "—"}</p>
      )}
    </div>
  );
}

function ProfileSelect({
  label,
  value,
  options,
  editing,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  editing: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-maroon-900/50 dark:text-cream-50/50">{label}</p>
      {editing ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-md border border-black/10 dark:border-white/20 px-2 py-1.5 text-sm outline-none focus:border-maroon-400"
        >
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <p className="mt-0.5 text-sm font-medium text-maroon-900 dark:text-cream-50">{value || "—"}</p>
      )}
    </div>
  );
}
