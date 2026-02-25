"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ApplicantsList, RequestCard } from "@/components/RequestCard";
import { agencyNav } from "@/app/agency/page";
import { confirmRequest, listApplications, listRequests, updateRequest, getApplicantProfile } from "@/lib/repo";
import type { Application, ApplicantProfile, Request } from "@/lib/types";

function ApplicantModal({ profile, onClose }: { profile: ApplicantProfile; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass max-w-sm w-full mx-4 p-5 space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-base font-semibold">{profile.name}</div>
            <div className="text-xs text-white/70 mt-0.5">{profile.gender} · {profile.age} years old</div>
          </div>
          <button className="glass-btn px-2 py-1 text-xs" onClick={onClose}>✕</button>
        </div>
        <div className="space-y-1.5 text-sm">
          <div><span className="muted">Languages: </span>{profile.languages.map(l => `${l.lang} (${l.level})`).join(", ")}</div>
          <div><span className="muted">Rating: </span>{"★".repeat(Math.round(profile.rating))}{"☆".repeat(5 - Math.round(profile.rating))} {profile.rating}/5</div>
          <div><span className="muted">Completed: </span>{profile.completedCount} requests</div>
          {profile.tursabCard && <div><span className="muted">Tursab ID: </span>{profile.tursabCard}</div>}
          {profile.kokartId && <div><span className="muted">Kokart ID: </span>{profile.kokartId}</div>}
        </div>
      </div>
    </div>
  );
}

export default function PendingRequests() {
  const router = useRouter();
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
  useEffect(() => { refresh(); }, []);

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
      {modalProfile && <ApplicantModal profile={modalProfile} onClose={() => setModalProfile(null)} />}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Active requests — Pending</div>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-sm text-white/75">No pending requests yet.</div>
          ) : (
            requests.map((r) => (
              <RequestCard key={r.id} request={r}>
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
                </div>
              </RequestCard>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
