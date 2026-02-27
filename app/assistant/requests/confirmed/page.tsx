"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RequestCard } from "@/components/RequestCard";
import { assistantNav } from "@/lib/nav";
import { archiveRequest, getTransportDetails, listRequests, resolveDetailsUpdate, getSignBoard } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { Request } from "@/lib/types";

export default function Confirmed() {
  const router = useRouter();
  const [items, setItems] = useState<Request[]>([]);
  const [transport, setTransport] = useState<Record<string, any>>({});
  const [signBoards, setSignBoards] = useState<Record<string, string | null>>({});

  async function refresh() {
    const p = await getCurrentProfile();
    const rs = await listRequests({ kind: "assistant", status: "confirmed" } as any);
    const mine = rs.filter(r => r.confirmedApplicantId === p?.id);
    setItems(mine);
    const t: Record<string, any> = {};
    const sb: Record<string, string | null> = {};
    for (const r of mine) {
      t[r.id] = await getTransportDetails(r.id);
      const board = await getSignBoard(r.id);
      sb[r.id] = board?.fileName ?? null;
    }
    setTransport(t);
    setSignBoards(sb);
  }
  useEffect(() => { refresh(); }, []);

  return (
    <AppShell role="assistant" navItems={assistantNav as any} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Active requests — Confirmed</div>
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-white/75">No confirmed requests.</div>
          ) : (
            items.map((r) => (
              <RequestCard key={r.id} request={r}>
                <div className="text-sm">
                  <span className="muted">Confirmed for: </span>
                  <span className="font-semibold">{r.confirmedPriceTry?.toLocaleString("tr-TR") ?? "—"} TRY</span>
                </div>
                <div className="text-sm">
                  <span className="muted">Driver & Transport: </span>
                  {transport[r.id] ? (
                    <span className="text-white/90">{transport[r.id].driverName} · {transport[r.id].carModel} · {transport[r.id].plate} · {transport[r.id].phone}</span>
                  ) : (
                    <span className="text-amber-100">Waiting for agent to add transport details</span>
                  )}
                </div>
                {signBoards[r.id] && (
                  <div className="text-sm flex items-center gap-2">
                    <span className="muted">Sign/Board: </span>
                    <span className="text-white/90">{signBoards[r.id]}</span>
                    <a
                      href="#"
                      className="glass-btn text-xs"
                      onClick={e => { e.preventDefault(); alert(`Mock download: ${signBoards[r.id]}`); }}
                    >Download</a>
                  </div>
                )}

                {r.pendingDetailsUpdate && (
                  <div className="border border-amber-200/30 bg-amber-500/10 rounded-xl p-3 space-y-2">
                    <div className="text-sm font-semibold text-amber-100">Some details have been updated by the agency.</div>
                    <div className="text-xs text-white/70">Please review the updated details above and confirm or refuse.</div>
                    <div className="flex gap-2">
                      <button className="glass-btn" type="button" onClick={async () => { await resolveDetailsUpdate(r.id, true); await refresh(); }}>
                        Accept changes
                      </button>
                      <button className="glass-btn" type="button" onClick={async () => { await resolveDetailsUpdate(r.id, false); router.push("/assistant"); }}>
                        Refuse & withdraw
                      </button>
                    </div>
                  </div>
                )}

                <button className="glass-btn" type="button" onClick={async () => { await archiveRequest(r.id); router.push("/assistant/requests/archive"); }}>
                  FINISH
                </button>
              </RequestCard>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
