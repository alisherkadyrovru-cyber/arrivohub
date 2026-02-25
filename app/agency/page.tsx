"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { agencyNav } from "@/lib/nav";

export default function AgencyHome() {
  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p)=>p.fullName} rightSlot={(p)=><span className="chip">Credits: {p.credits ?? 0}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Agency Dashboard</div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link className="glass-soft block rounded-2xl p-6 transition hover:bg-white/10 active:scale-[0.98]" href="/agency/requests/new-assistant">
            <div className="text-base font-semibold">Create new request (Arrival / Departure) for Assistants</div>
            <div className="mt-2 text-sm text-white/75">They will see it in their feed. Cost: 5 credits.</div>
          </Link>
          <Link className="glass-soft block rounded-2xl p-6 transition hover:bg-white/10 active:scale-[0.98]" href="/agency/requests/new-guide">
            <div className="text-base font-semibold">Create new request (Tour) for Guides</div>
            <div className="mt-2 text-sm text-white/75">They will see it in their feed. Cost: 10 credits.</div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
