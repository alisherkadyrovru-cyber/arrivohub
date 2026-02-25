"use client";
import { AppShell } from "@/components/AppShell";
import { guideNav } from "@/lib/nav";
export default function Subscription() {
  return (
    <AppShell role="guide" navItems={guideNav as any} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Subscription</div>
        <div className="glass-soft p-4 text-sm text-white/80">Pay to platform bank account and write your Cabinet ID in comment (demo).</div>
        <div className="glass-soft p-4">
          <div className="text-sm font-semibold">Pricing (demo)</div>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2"><span>14 days</span><span>1000 TRY</span></div>
<div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2"><span>1 month</span><span>1800 TRY</span></div>
<div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2"><span>3 month</span><span>5000 TRY</span></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
