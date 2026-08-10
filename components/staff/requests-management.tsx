"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, Eye, FileText, Award } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_TYPES } from "@/lib/data/documents";
import { REQUEST_STATUS_LABEL, type DocumentRequestRow, type RequestStatus } from "@/lib/supabase/types";

type RequestWithResident = DocumentRequestRow & {
  profiles: { full_name: string; mobile_number: string | null; email: string } | null;
};

const TABS: { key: RequestStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "ready", label: "Ready" },
  { key: "released", label: "Released" },
];

export function RequestsManagement({ requests }: { requests: RequestWithResident[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<RequestStatus | "all">("all");
  const [selected, setSelected] = useState<RequestWithResident | null>(null);
  const [fileUrls, setFileUrls] = useState<{ name: string; url: string }[]>([]);
  const [updating, setUpdating] = useState(false);

  const counts: Record<string, number> = { all: requests.length };
  for (const s of ["pending", "processing", "ready", "released", "rejected"]) {
    counts[s] = requests.filter((r) => r.status === s).length;
  }
  const filtered = tab === "all" ? requests : requests.filter((r) => r.status === tab);

  async function openRequest(r: RequestWithResident) {
    setSelected(r);
    setFileUrls([]);
    if (r.uploaded_files.length > 0) {
      const supabase = createClient();
      const urls = await Promise.all(
        r.uploaded_files.map(async (path) => {
          const { data } = await supabase.storage
            .from("document-requirements")
            .createSignedUrl(path, 3600);
          return { name: path.split("/").pop() ?? path, url: data?.signedUrl ?? "#" };
        })
      );
      setFileUrls(urls);
    }
  }

  async function updateStatus(status: RequestStatus) {
    if (!selected) return;
    setUpdating(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("document_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", selected.id);
    setUpdating(false);
    if (!error) {
      setSelected({ ...selected, status });
      router.refresh();
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="flex flex-wrap gap-2 rounded-card border border-black/5 bg-white p-3 shadow-sm">
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

        <div className="mt-4 overflow-hidden rounded-card border border-black/5 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-cream-50 text-left text-xs text-maroon-900/50">
                <th className="p-3 font-medium">Requestor</th>
                <th className="p-3 font-medium">Document Type</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-maroon-900/50">
                    No requests in this view.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => openRequest(r)}
                    className={cn(
                      "cursor-pointer border-b border-black/5 last:border-0 hover:bg-cream-50",
                      selected?.id === r.id && "bg-gold-100/40"
                    )}
                  >
                    <td className="p-3">
                      <p className="text-maroon-900">{r.profiles?.full_name ?? "—"}</p>
                      <p className="text-xs text-maroon-900/50">{r.profiles?.mobile_number ?? ""}</p>
                    </td>
                    <td className="p-3 text-maroon-900/70">
                      {DOCUMENT_TYPES.find((d) => d.dbType === r.document_type)?.name ?? r.document_type}
                    </td>
                    <td className="p-3 text-maroon-900/70">
                      {new Date(r.requested_at).toLocaleDateString("en-PH", { month: "short", day: "2-digit", year: "numeric" })}
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-cream-100 px-2 py-1 text-xs font-semibold text-maroon-900/70">
                        {REQUEST_STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.status === "released" || r.status === "rejected" ? (
                        <Eye className="h-4 w-4 text-maroon-900/40" />
                      ) : (
                        <FileText className="h-4 w-4 text-gold-600" />
                      )}
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
          <p className="py-10 text-center text-sm text-maroon-900/50">
            Select a request to view details.
          </p>
        ) : (
          <div>
            <p className="font-display text-lg font-semibold text-maroon-900">Request Details</p>
            <p className="mb-4 text-xs text-maroon-900/40">Request ID: {selected.id.slice(0, 8)}</p>

            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-maroon-100 text-sm font-semibold text-maroon-500">
                {selected.profiles?.full_name.charAt(0) ?? "?"}
              </span>
              <div>
                <p className="text-sm font-semibold text-maroon-900">{selected.profiles?.full_name ?? "—"}</p>
                <p className="text-xs text-maroon-900/50">{selected.profiles?.email}</p>
              </div>
            </div>

            <dl className="space-y-2 text-sm">
              <Row label="Document Type" value={DOCUMENT_TYPES.find((d) => d.dbType === selected.document_type)?.name ?? selected.document_type} />
              <Row label="Purpose" value={selected.purpose ?? "—"} />
              <Row label="Address" value={selected.address ?? "—"} />
              <Row label="Date Requested" value={new Date(selected.requested_at).toLocaleString("en-PH")} />
              <Row label="Current Status" value={REQUEST_STATUS_LABEL[selected.status]} />
            </dl>

            <p className="mb-2 mt-4 text-sm font-semibold text-maroon-900">
              Uploaded Requirements ({fileUrls.length})
            </p>
            {fileUrls.length === 0 ? (
              <p className="text-xs text-maroon-900/50">No files uploaded.</p>
            ) : (
              <ul className="space-y-1.5">
                {fileUrls.map((f) => (
                  <li key={f.url}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-md border border-black/10 px-2.5 py-1.5 text-xs text-maroon-500 hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" /> {f.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {selected.status !== "released" && selected.status !== "rejected" && (
              <div className="mt-5 space-y-2">
                {selected.status === "pending" && (
                  <Button className="w-full" disabled={updating} onClick={() => updateStatus("processing")}>
                    <Check className="h-4 w-4" /> Approve &amp; Start Processing
                  </Button>
                )}
                {selected.status === "processing" && (
                  <Button className="w-full" disabled={updating} onClick={() => updateStatus("ready")}>
                    Mark Ready for Release
                  </Button>
                )}
                {selected.status === "ready" && (
                  <Button className="w-full" disabled={updating} onClick={() => updateStatus("released")}>
                    Release to Resident
                  </Button>
                )}
                {(selected.status === "ready" || selected.status === "processing") && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/staff/certificates?request_id=${selected.id}`}>
                      <Award className="h-4 w-4" /> Generate Certificate
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full border-festival-red-500 text-festival-red-500 hover:bg-festival-red-100"
                  disabled={updating}
                  onClick={() => updateStatus("rejected")}
                >
                  <X className="h-4 w-4" /> Reject Request
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-maroon-900/50">{label}</dt>
      <dd className="text-right font-medium text-maroon-900">{value}</dd>
    </div>
  );
}
