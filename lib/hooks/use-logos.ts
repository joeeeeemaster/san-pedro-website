"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_SEAL = "/brand/logos/official-seal.png";
const DEFAULT_SK_LOGO = "/brand/logos/sk-logo.png";

/** Reads barangay_settings.official_seal_url / sk_logo_url once on mount.
 *  Falls back to the static default files if unset or unreachable. */
export function useLogos() {
  const [seal, setSeal] = useState(DEFAULT_SEAL);
  const [skLogo, setSkLogo] = useState(DEFAULT_SK_LOGO);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("barangay_settings")
      .select("official_seal_url, sk_logo_url")
      .eq("id", true)
      .single()
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.official_seal_url) setSeal(data.official_seal_url);
        if (data.sk_logo_url) setSkLogo(data.sk_logo_url);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { seal, skLogo };
}
