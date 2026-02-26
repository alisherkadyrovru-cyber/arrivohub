"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ApplicantsList, RequestCard } from "@/components/RequestCard";
import { ApplicantModal } from "@/components/ApplicantModal";
import { agencyNav } from "@/lib/nav";
import { confirmRequest, listApplications, listRequests, updateRequest, getApplicantProfile, publishForAll } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { Application, ApplicantProfile, Request } from "@/lib/types";

export default function PendingRequests() {
  const router = useRouter();
  const [agencyId, setAgencyId] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [appsMap, setAppsMap] = useState<Record<string, Application[]>>({});
  const [selected, setSelected] = useState<Record<string, string | null>>({});
  const [editPrice, setEditPrice] = useState<Record<string, string>>({});
  const [editPriceOpen, setEditPriceOpen] = useState<Record<string, boolean>>({});
  const [modalProfile, setModalProfile] = useState<ApplicantProfile | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  async function refresh() {
    const rs = await listRequests({ status: "open" });
    setRequests(rs);
    const map: Record<string, Application[]> = {};
    for (const r of rs) map[r.id] = await listApplications(r.id);
    setAppsMap(map);
  }

  useEffect(() => {
    getCurrentProfile().then(p => { if (p) setAgencyId(p.id); });
    refresh();
  }, []);

  async function handleConfirm(requestId: string) {
    const appId = selected[requestId];
    if (!appId) { setFeedback(f => ({ ...f, [requestId]: "Please select an applicant first." })); return; }
    await confirmRequest(requestId, appId);
    setFeedback(f => ({ ...f, [requestId]: "" }));
    await refresh();
  }

  async function handleChangePrice(requestId: string) {
    const val = parseInt(editPrice[requestId] ?? "", 10);
    if (isNaN(val) || val <= 0) { setFeedback(f => ({ ...f, [requestId]: "Enter a valid price." })); return; }
    const apps = appsMap[requestId] ?? [];
    if (apps.length > 0) { setFeedback(f => ({ ...f, [requestId]: "Cannot change price — applicants already applied." })); return; }
    await updateRequest(requestId, { priceTry: val } as any);
    setEditPriceOpen(p => ({ ...p, [requestId]: false }));
    setFeedback(f => ({ ...f, [requestId]: "" }));
    await refresh();
  }

  async function handleApplicantClick(applicantId: string) {
    const profile = await getApplicantProfile(applicantId);
    if (profile) setModalProfile(profile);
  }

  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Credits: {p.credits ?? 0}</span>}>
      {modalProfile && agencyId && (
        <ApplicantModal profile={modalProfile} onClose={() => setModalProfile(null)} showContact={false} agencyId={agencyId} />
      )}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Active requests — Pending</div>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-sm text-white/75">No pending requests yet.</div>
          ) : (
            requests.map((r) => (
              <RequestCard key={r.id} request={r}>
                {(r as any).onlyFavorites && (
                  <div className="flex justify-end">
                    <span className="chip text-xs border-amber-300/40 bg-amber-400/15 text-amber-100">Only for my favorites</span>
                  </div>
                )}
                <ApplicantsList
                  applications={appsMap[r.id] ?? []}
                  selectedId={selected[r.id] ?? null}
                  onSelect={(id) => setSelected(s => ({ ...s, [r.id]: s[r.id] === id ? null : id }))}
                  onApplicantClick={handleApplicantClick}
                />
                {feedback[r.id] && (
                  <div className="text-xs text-red-200 bg-red-500/10 border border-red-200/20 rounded-xl px-3 py-2">{feedback[r.id]}</div>
                )}
                <div className="flex flex-wrap gap-2">
                  <button className="glass-btn" type="button" onClick={() => handleConfirm(r.id)}>
                    Confirm for selected
                  </button>

                  {editPriceOpen[r.id] ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input w-28"
                        placeholder="New price"
                        value={editPrice[r.id] ?? ""}
                        onChange={e => setEditPrice(p => ({ ...p, [r.id]: e.target.value }))}
                      />
                      <span className="text-sm text-white/70">TRY</span>
                      <button className="glass-btn" type="button" onClick={() => handleChangePrice(r.id)}>Save</button>
                      <button className="glass-btn" type="button" onClick={() => setEditPriceOpen(p => ({ ...p, [r.id]: false }))}>Cancel</button>
                    </div>
                  ) : (
                    <button className="glass-btn" type="button" onClick={() => {
                      setEditPrice(p => ({ ...p, [r.id]: String(r.priceTry) }));
                      setEditPriceOpen(p => ({ ...p, [r.id]: true }));
                    }}>
                      Change the Price
                    </button>
                  )}

                  <button className="glass-btn" type="button" onClick={() => router.push(`/agency/requests/${r.id}/change-details?from=pending`)}>
                    Change details
                  </button>

                  {(r as any).onlyFavorites && (
                    <button className="glass-btn" type="button" onClick={async () => { await publishForAll(r.id); await refresh(); }}>
                      Publish for all
                    </button>
                  )}
                </div>
              </RequestCard>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
