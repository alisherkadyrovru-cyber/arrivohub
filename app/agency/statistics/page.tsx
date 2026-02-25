"use client";
import { AppShell } from "@/components/AppShell";
import { agencyNav } from "@/app/agency/page";
export default function StatisticsLocked() {
  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p)=>p.fullName} rightSlot={(p)=><span className="chip">Credits: {p.credits ?? 0}</span>}>
      <div className="glass-soft p-6 text-center">
        <div className="text-2xl mb-2">🔒</div>
        <div className="text-base font-semibold">Statistics — Coming Soon</div>
        <div className="mt-1 text-sm text-white/70">This section will be available in a future update.</div>
      </div>
    </AppShell>
  );
}
