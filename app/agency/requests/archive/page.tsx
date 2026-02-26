"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequestCard } from "@/components/RequestCard";
import { ApplicantModal } from "@/components/ApplicantModal";
import { agencyNav } from "@/lib/nav";
import { listRequests, getTransportDetails, getApplicantProfile } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { ApplicantProfile, Request } from "@/lib/types";

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default function Archive() {
  const [agencyId, setAgencyId] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [transport, setTransport] = useState<Record<string, any>>({});
  const [modalProfile, setModalProfile] = useState<ApplicantProfile | null>(null);

  useEffect(() => {
    getCurrentProfile().then(p => { if (p) setAgencyId(p.id); });
    (async () => {
      const rs = await listRequests({ status: "archived" });
      setRequests(rs);
      const t: Record<string, any> = {};
      for (const r of rs) t[r.id] = await getTransportDetails(r.id);
      setTransport(t);
    })();
  }, []);

  async function handleNameClick(applicantId?: string) {
    if (!applicantId) return;
    const profile = await getApplicantProfile(applicantId);
    if (profile) setModalProfile(profile);
  }

  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Credits: {p.credits ?? 0}</span>}>
      {modalProfile && agencyId && (
        <ApplicantModal profile={modalProfile} onClose={() => setModalProfile(null)} showContact={true} agencyId={agencyId} />
      )}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Archived requests</div>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-sm text-white/75">Archive is empty.</div>
          ) : requests.map(r => (
            <RequestCard key={r.id} request={r}>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="muted">Completed by: </span>
                  <button className="font-semibold underline underline-offset-2 hover:opacity-75" onClick={() => handleNameClick((r as any).confirmedApplicantId)}>
                    {(r as any).confirmedApplicantName ?? "—"}
                  </button>
                </div>
                <div><span className="muted">Agreed price: </span><span className="font-semibold">{(r as any).confirmedPriceTry?.toLocaleString("tr-TR") ?? "—"} TRY</span></div>
                {transport[r.id] ? (
                  <div><span className="muted">Driver & transport: </span><span className="text-white/85">{transport[r.id].driverName} · {transport[r.id].carModel} · {transport[r.id].plate} · {transport[r.id].phone}</span></div>
                ) : null}
                <div><span className="muted">Finished at: </span><span className="text-white/85">{fmtDateTime((r as any).finishedAt)}</span></div>
              </div>
            </RequestCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
