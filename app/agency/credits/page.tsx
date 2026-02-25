"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { agencyNav } from "@/app/agency/page";
import { listCreditsLedger } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";

export default function Credits() {
  const [ledger,setLedger]=useState<any[]>([]);
  useEffect(()=>{ (async()=>{ const p=await getCurrentProfile(); if(!p) return; setLedger(await listCreditsLedger(p.id)); })(); },[]);
  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p)=>p.fullName} rightSlot={(p)=><span className="chip">Credits: {p.credits ?? 0}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Credits</div>

        <div className="glass-soft p-4 text-sm text-white/80">
          <div className="font-semibold">Top-up instructions (demo)</div>
          <div className="mt-1 text-xs">Send payment to company bank account and write your Cabinet ID in the transfer comment.</div>
        </div>

        <div className="glass-soft p-4">
          <div className="text-sm font-semibold">Pricing (demo)</div>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2"><span>100 credits</span><span>1000 TRY</span></div>
            <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2"><span>200 credits</span><span>1800 TRY</span></div>
          </div>
        </div>

        <div className="glass-soft p-4">
          <div className="text-sm font-semibold">Ledger (demo)</div>
          <div className="mt-3 space-y-2 text-xs">
            {ledger.length===0 ? <div className="text-white/70">No records.</div> : ledger.map((r)=>(
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                <span>{r.note}</span>
                <span className={r.delta>=0 ? "text-emerald-100" : "text-red-100"}>{r.delta>=0 ? `+${r.delta}` : r.delta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
