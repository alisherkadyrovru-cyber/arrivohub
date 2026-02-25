"use client";
import { AppShell } from "@/components/AppShell";
import { guideNav } from "@/app/guide/page";
export default function Stats() {
  return (
    <AppShell role="guide" navItems={guideNav as any} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Statistics</div>
        <div className="glass-soft p-6 text-center text-sm text-white/60">
          <div className="text-2xl mb-2">🔒</div>
          Statistics will be available in a future update.
        </div>
      </div>
    </AppShell>
  );
}
