"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequestCard } from "@/components/RequestCard";
import { guideNav } from "@/lib/nav";
import { listApplications, listRequests } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { Request } from "@/lib/types";

export default function Pending() {
  const [items, setItems] = useState<Request[]>([]);
  const [offers, setOffers] = useState<Record<string, number | null>>({});
  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      const rs = await listRequests({ kind: "guide" } as any);
      const mine: Request[] = [];
      const off: Record<string, number | null> = {};
      for (const r of rs) {
        const apps = await listApplications(r.id);
        const my = apps.find(a => a.applicantId === p?.id);
        if (my && r.status === "open") { mine.push(r); off[r.id] = my.offerTry; }
      }
      setItems(mine); setOffers(off);
    })();
  }, []);

  return (
    <AppShell role="guide" navItems={guideNav as any} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Active requests — Pending</div>
        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-sm text-white/75">No pending applications.</div>
          ) : (
            items.map((r) => (
              <RequestCard key={r.id} request={r}>
                <div className="flex items-center gap-4 text-sm">
                  <span className="chip bg-amber-500/20 border-amber-200/30 text-amber-100">Waiting confirmation</span>
                  <span className="text-white/70">My offer: {offers[r.id] == null ? "None (listed price)" : `${offers[r.id]!.toLocaleString("tr-TR")} TRY`}</span>
                </div>
              </RequestCard>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
