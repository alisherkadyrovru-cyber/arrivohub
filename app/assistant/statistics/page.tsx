"use client";
import { AppShell } from "@/components/AppShell";
import { assistantNav } from "@/lib/nav";
export default function Stats() {
  return (
    <AppShell role="assistant" navItems={assistantNav as any} centerTitle={(p)=>p.fullName} rightSlot={(p)=><span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="glass-soft p-6 text-center">
        <div className="text-2xl mb-2">🔒</div>
        <div className="text-base font-semibold">Statistics — Coming Soon</div>
        <div className="mt-1 text-sm text-white/70">This section will be available in a future update.</div>
      </div>
    </AppShell>
  );
}
