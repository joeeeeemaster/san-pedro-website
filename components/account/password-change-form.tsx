"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleChangePassword() {
    if (password.length < 6) {
      setNotice("Password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    setNotice(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    setNotice(error ? error.message : "Password updated.");
    if (!error) setPassword("");
  }

  return (
    <div>
      <label className="text-sm font-medium text-maroon-900 dark:text-cream-50">New Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 6 characters"
        className="mt-1 w-full max-w-sm rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:border-maroon-400 dark:bg-maroon-900 dark:text-cream-50"
      />
      {notice && <p className="mt-2 text-xs text-maroon-900/60 dark:text-cream-50/60">{notice}</p>}
      <div className="mt-3">
        <Button onClick={handleChangePassword} disabled={saving || !password}>
          {saving ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </div>
  );
}
