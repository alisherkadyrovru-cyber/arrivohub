"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequestCard } from "@/components/RequestCard";
import { addApplication, listApplications, listRequests } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import { guideNav } from "@/lib/nav";
import type { Profile, Request } from "@/lib/types";

export default function Feed() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [me, setMe] = useState<Profile | null>(null);
  const [offerInputs, setOfferInputs] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      setMe(p);
      const rs = await listRequests({ kind: "guide", status: "open" } as any);
      const filtered: Request[] = [];
      for (const r of rs) {
        const apps = await listApplications(r.id);
        const alreadyApplied = apps.find(a => a.applicantId === p?.id);
        if (apps.length < 5 && !alreadyApplied) filtered.push(r);
      }
      setRequests(filtered);
    })();
  }, []);

  async function apply(requestId: string, offerTry: number | null) {
    if (!me) return;
    try {
      await addApplication(requestId, { applicantId: me.id, applicantName: me.fullName, role: "guide", offerTry });
      setApplied(a => ({ ...a, [requestId]: true }));
      setFeedback(f => ({ ...f, [requestId]: "Applied — waiting for confirmation." }));
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err: any) {
      setFeedback(f => ({ ...f, [requestId]: err?.message ?? "Error" }));
    }
  }

  return (
    <AppShell role="guide" navItems={guideNav as any} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Feed — available tour requests</div>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-sm text-white/75">No available requests at the moment.</div>
          ) : (
            requests.map((r) => (
              <RequestCard key={r.id} request={r}>
                {feedback[r.id] && (
                  <div className="text-xs text-emerald-100 bg-emerald-500/10 border border-emerald-200/20 rounded-xl px-3 py-2">{feedback[r.id]}</div>
                )}
                {!applied[r.id] && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button className="glass-btn" type="button" onClick={() => apply(r.id, null)}>
                      ACCEPT
                    </button>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="input w-28"
                        placeholder="Your price"
                        value={offerInputs[r.id] ?? ""}
                        onChange={e => setOfferInputs(p => ({ ...p, [r.id]: e.target.value }))}
                        min={1}
                      />
                      <span className="text-sm text-white/70">TRY</span>
                      <button className="glass-btn" type="button" onClick={() => {
                        const n = parseInt(offerInputs[r.id] ?? "", 10);
                        if (isNaN(n) || n <= 0) { setFeedback(f => ({ ...f, [r.id]: "Enter a valid price." })); return; }
                        apply(r.id, n);
                      }}>
                        Offer your Price
                      </button>
                    </div>
                  </div>
                )}
              </RequestCard>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
