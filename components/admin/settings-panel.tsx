"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Home, Image as ImageIcon, Palette, ShieldCheck, Sun, Moon, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";
import { PasswordChangeForm } from "@/components/account/password-change-form";
import type { BarangaySettings } from "@/lib/supabase/types";

const TABS = [
  { key: "info", label: "Barangay Info", icon: Home },
  { key: "branding", label: "Logo & Branding", icon: ImageIcon },
  { key: "theme", label: "Theme", icon: Palette },
  { key: "security", label: "Account & Security", icon: ShieldCheck },
] as const;

export function SettingsPanel({ initialSettings }: { initialSettings: BarangaySettings }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("info");
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function update<K extends keyof BarangaySettings>(key: K, value: BarangaySettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("barangay_settings")
      .update({
        barangay_name: settings.barangay_name,
        municipality: settings.municipality,
        province: settings.province,
        complete_address: settings.complete_address,
        official_email: settings.official_email,
        contact_number: settings.contact_number,
        office_hours: settings.office_hours,
        about_description: settings.about_description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
    setSaving(false);
    setNotice(error ? error.message : "Settings saved.");
    if (!error) router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <div className="flex gap-2 overflow-x-auto lg:flex-col">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors",
              tab === t.key ? "bg-gold-100 text-maroon-600" : "text-maroon-900/70 hover:bg-cream-100 dark:text-cream-50/70 dark:hover:bg-maroon-700"
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-card border border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-maroon-700">
        {tab === "info" && (
          <div>
            <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">
              Barangay Information
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Barangay Name" value={settings.barangay_name} onChange={(v) => update("barangay_name", v)} />
              <Field label="Official Email" value={settings.official_email} onChange={(v) => update("official_email", v)} />
              <Field label="Municipality" value={settings.municipality} onChange={(v) => update("municipality", v)} />
              <Field label="Office Hours" value={settings.office_hours} onChange={(v) => update("office_hours", v)} />
              <Field label="Province" value={settings.province} onChange={(v) => update("province", v)} />
              <Field label="Contact Number" value={settings.contact_number} onChange={(v) => update("contact_number", v)} />
              <div className="sm:col-span-2">
                <Field label="Complete Address" value={settings.complete_address} onChange={(v) => update("complete_address", v)} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-maroon-900 dark:text-cream-50">About / Description</label>
                <textarea
                  value={settings.about_description}
                  onChange={(e) => update("about_description", e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400 dark:bg-maroon-900 dark:text-cream-50"
                />
              </div>
            </div>

            {notice && <p className="mt-4 rounded-md bg-cream-50 px-3 py-2 text-xs text-maroon-900/70 dark:bg-maroon-900 dark:text-cream-50/70">{notice}</p>}

            <div className="mt-5 flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}

        {tab === "branding" && <BrandingTab settings={settings} onUpdated={(patch) => setSettings((s) => ({ ...s, ...patch }))} />}

        {tab === "theme" && <ThemeTab />}

        {tab === "security" && <SecurityTab />}
      </div>
    </div>
  );
}

function BrandingTab({
  settings,
  onUpdated,
}: {
  settings: BarangaySettings;
  onUpdated: (patch: Partial<BarangaySettings>) => void;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState<"seal" | "sk_logo" | null>(null);
  const [uploading, setUploading] = useState<"seal" | "sk_logo" | null>(null);
  const sealInputRef = useRef<HTMLInputElement>(null);
  const skInputRef = useRef<HTMLInputElement>(null);

  function proceedToFilePicker() {
    if (confirming === "seal") sealInputRef.current?.click();
    if (confirming === "sk_logo") skInputRef.current?.click();
    setConfirming(null);
  }

  async function handleFileSelected(which: "seal" | "sk_logo", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(which);

    const supabase = createClient();
    const path = which === "seal" ? "official-seal.png" : "sk-logo.png";
    const { error: uploadError } = await supabase.storage.from("logos").upload(path, file, { upsert: true });

    if (uploadError) {
      setUploading(null);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(path);
    const bustedUrl = `${publicUrl}?t=${Date.now()}`;
    const column = which === "seal" ? "official_seal_url" : "sk_logo_url";

    const { error: updateError } = await supabase
      .from("barangay_settings")
      .update({ [column]: bustedUrl, updated_at: new Date().toISOString() })
      .eq("id", true);

    setUploading(null);
    if (!updateError) {
      onUpdated({ [column]: bustedUrl } as Partial<BarangaySettings>);
      router.refresh();
    }
  }

  return (
    <div>
      <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">Official Logos</p>
      <p className="mb-4 text-sm text-maroon-900/60 dark:text-cream-50/60">
        Click a logo to replace it. Changes apply site-wide immediately — every page that shows these logos
        reads the current URL, not a fixed file.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <LogoSlot
          label="Official Barangay Seal"
          src={settings.official_seal_url || "/brand/logos/official-seal.png"}
          uploading={uploading === "seal"}
          onClick={() => setConfirming("seal")}
        />
        <LogoSlot
          label="Sangguniang Kabataan Logo"
          src={settings.sk_logo_url || "/brand/logos/sk-logo.png"}
          uploading={uploading === "sk_logo"}
          onClick={() => setConfirming("sk_logo")}
        />
      </div>

      <input ref={sealInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelected("seal", e)} />
      <input ref={skInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelected("sk_logo", e)} />

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-card bg-white p-6 text-center shadow-lg">
            <p className="font-display text-lg font-semibold text-maroon-900">Replace this logo?</p>
            <p className="mt-2 text-sm text-maroon-900/60">
              You&apos;ll be asked to choose a new image. This replaces the logo everywhere on the site.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
              <Button onClick={proceedToFilePicker}>Yes, Replace</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LogoSlot({
  label,
  src,
  uploading,
  onClick,
}: {
  label: string;
  src: string;
  uploading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={uploading}
      className="group relative rounded-card border border-black/10 p-4 text-center transition-colors hover:border-gold-500"
    >
      <div className="relative mx-auto h-[100px] w-[100px]">
        <Image src={src} alt={label} fill className="rounded-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
          <Pencil className="h-5 w-5 text-white" />
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-maroon-900 dark:text-cream-50">{label}</p>
      {uploading && <p className="mt-1 text-xs text-maroon-900/50">Uploading...</p>}
    </button>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-maroon-900 dark:text-cream-50">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400 dark:bg-maroon-900 dark:text-cream-50"
      />
    </div>
  );
}

function ThemeTab() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">Appearance</p>
      <p className="mb-4 text-sm text-maroon-900/60 dark:text-cream-50/60">
        Applies to the Staff and Admin dashboards. The public site and resident portal always use the
        light theme, matching the approved design.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => theme !== "light" && toggleTheme()}
          className={cn(
            "flex flex-1 flex-col items-center gap-2 rounded-card border-2 p-4",
            theme === "light" ? "border-gold-500 bg-gold-100/40" : "border-black/10"
          )}
        >
          <Sun className="h-6 w-6 text-gold-600" />
          <span className="text-sm font-medium text-maroon-900 dark:text-cream-50">Light Mode</span>
        </button>
        <button
          onClick={() => theme !== "dark" && toggleTheme()}
          className={cn(
            "flex flex-1 flex-col items-center gap-2 rounded-card border-2 p-4",
            theme === "dark" ? "border-gold-500 bg-gold-100/40" : "border-black/10"
          )}
        >
          <Moon className="h-6 w-6 text-maroon-500" />
          <span className="text-sm font-medium text-maroon-900 dark:text-cream-50">Dark Mode</span>
        </button>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div>
      <p className="font-display mb-4 text-lg font-semibold text-maroon-900 dark:text-cream-50">
        Account &amp; Security
      </p>
      <PasswordChangeForm />
    </div>
  );
}
