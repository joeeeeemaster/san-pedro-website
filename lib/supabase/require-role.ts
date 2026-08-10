import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/supabase/get-current-profile";
import { roleHomePath } from "@/lib/route-access";
import type { UserRole } from "@/lib/supabase/types";

export async function requireRole(allowed: UserRole[]) {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");

  if (!allowed.includes(session.profile.role)) {
    redirect(roleHomePath(session.profile.role));
  }

  return session;
}
