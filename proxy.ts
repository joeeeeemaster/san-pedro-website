import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { matchProtectedPrefix, roleHomePath, PROTECTED_PREFIXES, type AppRole } from "@/lib/route-access";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const matchedPrefix = matchProtectedPrefix(request.nextUrl.pathname);

  // No Supabase project connected yet. Let protected routes render as open
  // previews rather than crashing. Remove this guard once env vars are set.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (matchedPrefix) {
      console.warn(
        `[proxy] ${matchedPrefix} is unprotected — Supabase env vars are not set yet.`
      );
    }
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!matchedPrefix) {
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as AppRole | undefined;

  if (!role) {
    // Signed in, but no readable profile row — something's wrong with this
    // account's setup. Don't guess a fallback (that's how a self-redirect
    // loop happened before); send them back to login instead.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!PROTECTED_PREFIXES[matchedPrefix].includes(role)) {
    // Signed in, wrong role for this section — send them to their own home.
    // roleHomePath(role) is guaranteed to differ from matchedPrefix here,
    // since we only reach this branch when role is NOT allowed at matchedPrefix.
    return NextResponse.redirect(new URL(roleHomePath(role), request.url));
  }

  return response;
}

export const config = {
  matcher: ["/portal/:path*", "/staff/:path*", "/admin/:path*"],
};
