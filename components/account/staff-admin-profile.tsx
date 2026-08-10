"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordChangeForm } from "@/components/account/password-change-form";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

export function StaffAdminProfileForm({ userId, initialProfile }: { userId: string; initialProfile: Profile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.full_name);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    try {
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      const bustedUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.from("profiles").update({ avatar_url: bustedUrl }).eq("id", userId);
      if (updateError) throw updateError;

      setProfile((p) => ({ ...p, avatar_url: bustedUrl }));
      router.refresh();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveName() {
    setSaving(true);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", userId);
    setSaving(false);
    setNotice(error ? error.message : "Saved.");
    if (!error) router.refresh();
  }

  const roleLabel = profile.position || (profile.role === "admin" ? "Punong Barangay" : "Barangay Staff");

  return (
    <div className="grid gap-5 md:grid-cols-[260px_1fr]">
      <Card>
        <CardContent className="flex flex-col items-center p-6 text-center">
          <div className="relative">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-maroon-100 text-2xl font-semibold text-maroon-500">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt={profile.full_name} fill className="object-cover" />
              ) : (
                profile.full_name.charAt(0) || "?"
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-maroon-900 disabled:opacity-60"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
          </div>
          {uploadingAvatar && <p className="mt-2 text-xs text-maroon-900/50">Uploading...</p>}
          {avatarError && <p className="mt-2 text-xs text-festival-red-600">{avatarError}</p>}
          <p className="font-display mt-3 text-lg font-semibold text-maroon-900 dark:text-cream-50">
            {profile.full_name || "(no name)"}
          </p>
          <p className="text-xs text-maroon-900/50 dark:text-cream-50/50">{roleLabel}</p>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <Card>
          <CardContent className="p-5">
            <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">
              Personal Information
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-maroon-900 dark:text-cream-50">Full Name</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400 dark:bg-maroon-900 dark:text-cream-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-maroon-900 dark:text-cream-50">Email Address</label>
                <p className="mt-1 rounded-md bg-cream-50 px-3 py-2 text-sm text-maroon-900/70 dark:bg-maroon-900 dark:text-cream-50/70">
                  {profile.email}
                </p>
              </div>
            </div>
            {notice && <p className="mt-3 text-xs text-maroon-900/60 dark:text-cream-50/60">{notice}</p>}
            <div className="mt-4">
              <Button onClick={handleSaveName} disabled={saving || fullName === profile.full_name}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">
              Account &amp; Security
            </p>
            <PasswordChangeForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
