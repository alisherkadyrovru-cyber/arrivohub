"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RequestCard } from "@/components/RequestCard";
import { ApplicantModal } from "@/components/ApplicantModal";
import { agencyNav } from "@/lib/nav";
import { getTransportDetails, listRequests, setTransportDetails, getApplicantProfile, setSignBoard, getSignBoard } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { ApplicantProfile, Request } from "@/lib/types";

type Transport = { driverName: string; carModel: string; plate: string; phone: string };

function TransportForm({ requestId, existing, onSaved }: { requestId: string; existing: Transport | null; onSaved: () => void }) {
  const [driverName, setDriverName] = useState(existing?.driverName ?? "");
  const [carModel, setCarModel] = useState(existing?.carModel ?? "");
  const [plate, setPlate] = useState(existing?.plate ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");

  return (
    <div className="grid gap-2 md:grid-cols-2 border-t border-white/10 pt-3 mt-1">
      <label className="block">
        <div className="label">Driver name</div>
        <input className="input mt-1" value={driverName} onChange={e => setDriverName(e.target.value)} />
      </label>
      <label className="block">
        <div className="label">Car model</div>
        <input className="input mt-1" value={carModel} onChange={e => setCarModel(e.target.value)} />
      </label>
      <label className="block">
        <div className="label">Plate</div>
        <input className="input mt-1" value={plate} onChange={e => setPlate(e.target.value)} />
      </label>
      <label className="block">
        <div className="label">Phone</div>
        <input className="input mt-1" value={phone} onChange={e => setPhone(e.target.value)} />
      </label>
      <div className="md:col-span-2">
        <button className="glass-btn" type="button" onClick={async () => {
          if (!driverName) return;
          await setTransportDetails(requestId, { driverName, carModel, plate, phone });
          onSaved();
        }}>Save transport details</button>
      </div>
    </div>
  );
}

export default function ConfirmedRequests() {
  const router = useRouter();
  const [agencyId, setAgencyId] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [transport, setTransport] = useState<Record<string, Transport | null>>({});
  const [transportFormOpen, setTransportFormOpen] = useState<Record<string, boolean>>({});
  const [modalProfile, setModalProfile] = useState<ApplicantProfile | null>(null);
  const [signBoards, setSignBoards] = useState<Record<string, string | null>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function refresh() {
    const rs = await listRequests({ status: "confirmed" });
    setRequests(rs);
    const t: Record<string, Transport | null> = {};
    const sb: Record<string, string | null> = {};
    for (const r of rs) {
      t[r.id] = await getTransportDetails(r.id);
      const board = await getSignBoard(r.id);
      sb[r.id] = board?.fileName ?? null;
    }
    setTransport(t);
    setSignBoards(sb);
  }

  useEffect(() => {
    getCurrentProfile().then(p => { if (p) setAgencyId(p.id); });
    refresh();
  }, []);

  async function handleNameClick(applicantId?: string) {
    if (!applicantId) return;
    const profile = await getApplicantProfile(applicantId);
    if (profile) setModalProfile(profile);
  }

  async function handleSignBoardUpload(requestId: string, file: File) {
    await setSignBoard(requestId, file.name);
    setSignBoards(prev => ({ ...prev, [requestId]: file.name }));
  }

  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Credits: {p.credits ?? 0}</span>}>
      {modalProfile && agencyId && (
        <ApplicantModal profile={modalProfile} onClose={() => setModalProfile(null)} showContact={true} agencyId={agencyId} />
      )}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Active requests — Confirmed</div>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-sm text-white/75">No confirmed requests yet.</div>
          ) : (
            requests.map((r) => (
              <RequestCard key={r.id} request={r}>
                <div className="text-sm">
                  <span className="muted">Confirmed {r.kind === "assistant" ? "Assistant" : "Guide"}: </span>
                  <button
                    className="font-semibold underline underline-offset-2 hover:opacity-75"
                    onClick={() => handleNameClick(r.confirmedApplicantId)}
                  >
                    {r.confirmedApplicantName ?? "—"}
                  </button>
                  {r.confirmedPriceTry != null && <span className="ml-2 text-white/70">· {r.confirmedPriceTry.toLocaleString("tr-TR")} TRY</span>}
                </div>

                <div className="text-sm">
                  <span className="muted">Driver & Transport: </span>
                  {transport[r.id] ? (
                    <span className="text-white/90">
                      {transport[r.id]!.driverName} · {transport[r.id]!.carModel} · {transport[r.id]!.plate} · {transport[r.id]!.phone}
                    </span>
                  ) : (
                    <span className="text-white/70">Waiting</span>
                  )}
                </div>

                {signBoards[r.id] && (
                  <div className="text-sm">
                    <span className="muted">Sign/Board: </span>
                    <span className="text-white/90">{signBoards[r.id]}</span>
                  </div>
                )}

                {transportFormOpen[r.id] ? (
                  <TransportForm
                    requestId={r.id}
                    existing={transport[r.id]}
                    onSaved={async () => { setTransportFormOpen(p => ({ ...p, [r.id]: false })); await refresh(); }}
                  />
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <button className="glass-btn" type="button" onClick={() => setTransportFormOpen(p => ({ ...p, [r.id]: !p[r.id] }))}>
                    {transport[r.id] ? "Edit Driver & Transport" : "Add Driver & Transport details"}
                  </button>
                  <button className="glass-btn" type="button" onClick={() => fileRefs.current[r.id]?.click()}>
                    {signBoards[r.id] ? "Change Sign/Board" : "Add Sign/Board"}
                  </button>
                  <input
                    ref={el => { fileRefs.current[r.id] = el; }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleSignBoardUpload(r.id, f); }}
                  />
                  <button className="glass-btn" type="button" onClick={() => router.push(`/agency/requests/${r.id}/change-details?from=confirmed`)}>
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
