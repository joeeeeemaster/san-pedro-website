"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { isRoleAllowedForPath, roleHomePath, type AppRole } from "@/lib/route-access";
import { useLogos } from "@/lib/hooks/use-logos";

export default function LoginPage() {
  const router = useRouter();
  const { seal, skLogo } = useLogos();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError(signInError?.message ?? "Unable to sign in. Please try again.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role as AppRole | undefined;
    const requestedRedirect = new URLSearchParams(window.location.search).get("redirectTo");

    // Only honor redirectTo if this user's actual role is allowed there —
    // otherwise an admin who once tried to visit /portal while logged out
    // would get sent to /portal here regardless of their real role, and
    // immediately bounced back out by the proxy. Fall back to their real home instead.
    const destination =
      requestedRedirect && isRoleAllowedForPath(role, requestedRedirect)
        ? requestedRedirect
        : roleHomePath(role);

    router.push(destination);
    router.refresh();
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-maroon-500 md:flex md:flex-col md:justify-end">
        <Image
          src="/brand/tier-1/login-panel-illustration.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-10 p-12">
          <h1 className="font-display text-4xl font-semibold leading-tight text-white">
            Bridging Faith
            <br />
            and Heritage
          </h1>
          <div className="my-4 h-px w-16 bg-gold-500" />
          <p className="text-sm text-cream-50/85">Barangay San Pedro · Bacacay, Albay</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex justify-center gap-3">
            <Image
              src={seal}
              alt="Barangay San Pedro Official Seal"
              width={64}
              height={64}
              className="rounded-full"
            />
            <Image
              src={skLogo}
              alt="Sangguniang Kabataan San Pedro Logo"
              width={64}
              height={64}
              className="rounded-full"
            />
          </div>

          <h2 className="font-display text-center text-2xl font-semibold text-maroon-500">
            Welcome Back
          </h2>
          <p className="mt-1 text-center text-sm text-maroon-900/60">
            Sign in to access the Barangay Digital Services Portal.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-maroon-900">Email Address</label>
              <div className="relative mt-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-900/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan.dela.cruz@email.com"
                  className="w-full rounded-md border border-black/10 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-maroon-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-maroon-900">Password</label>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon-900/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-md border border-black/10 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-maroon-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-900/40"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-maroon-900/70">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-maroon-500"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="font-medium text-maroon-500 hover:underline">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="rounded-md bg-festival-red-100 px-3 py-2 text-sm text-festival-red-600">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Log In"}
            </Button>

            <p className="text-center text-xs text-maroon-900/50">
              Residents, Staff, and Admin use the same login — access is role-based.
            </p>
          </form>

          <Button asChild variant="outline" className="mt-4 w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        <p className="text-xs text-maroon-900/40">
          © {new Date().getFullYear()} Barangay San Pedro, Bacacay, Albay.
        </p>
      </div>
    </div>
  );
}
