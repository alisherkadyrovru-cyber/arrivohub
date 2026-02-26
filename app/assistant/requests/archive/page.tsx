"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequestCard } from "@/components/RequestCard";
import { assistantNav } from "@/lib/nav";
import { listRequests, getTransportDetails } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { Request } from "@/lib/types";

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default function Archive() {
  const [items, setItems] = useState<Request[]>([]);
  const [transport, setTransport] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      const rs = await listRequests({ kind: "assistant", status: "archived" } as any);
      const mine = rs.filter(r => (r as any).confirmedApplicantId === p?.id);
      setItems(mine);
      const t: Record<string, any> = {};
      for (const r of mine) t[r.id] = await getTransportDetails(r.id);
      setTransport(t);
    })();
  }, []);

  return (
    <AppShell role="assistant" navItems={assistantNav as any} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Archive</div>
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-white/75">Archive is empty.</div>
          ) : items.map(r => (
            <RequestCard key={r.id} request={r}>
              <div className="space-y-1 text-sm">
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
