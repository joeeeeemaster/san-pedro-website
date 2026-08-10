import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";

import { PortalLayout } from "@/components/layouts/portal-layout";
import { RequestsList } from "@/components/portal/requests-list";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/supabase/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import type { DocumentRequestRow } from "@/lib/supabase/types";

export default async function MyRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const session = await getCurrentProfile();
  if (!session) redirect("/login");
  const { userId, profile } = session;
  const { submitted } = await searchParams;

  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("document_requests")
    .select("*")
    .eq("resident_id", userId)
    .order("requested_at", { ascending: false });

  return (
    <PortalLayout user={{ name: profile.full_name, avatarUrl: profile.avatar_url ?? undefined }}>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-maroon-900 dark:text-cream-50">My Document Requests</h1>
        <Button asChild size="sm">
          <Link href="/portal/requests/new">
            <Plus className="h-4 w-4" /> New Request
          </Link>
        </Button>
      </div>

      {submitted === "1" && (
        <div className="mb-5 flex items-center gap-2 rounded-card border border-bamboo-green-500/30 bg-bamboo-green-100 px-4 py-3 text-sm text-bamboo-green-600">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Your request has been submitted. We&apos;ll update its status here as it&apos;s processed.
        </div>
      )}

      <RequestsList requests={(requests ?? []) as DocumentRequestRow[]} />
    </PortalLayout>
  );
}
