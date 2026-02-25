"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequestCard } from "@/components/RequestCard";
import { assistantNav } from "@/lib/nav";
import { listRequests } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { Request } from "@/lib/types";

export default function Archive() {
  const [items, setItems] = useState<Request[]>([]);
  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      const rs = await listRequests({ kind: "assistant", status: "archived" } as any);
      setItems(rs.filter(r => r.confirmedApplicantId === p?.id));
    })();
  }, []);
  return (
    <AppShell role="assistant" navItems={assistantNav as any} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Archive</div>
        <div className="space-y-3">
          {items.length===0 ? <div className="text-sm text-white/75">Archive is empty.</div> : items.map(r=><RequestCard key={r.id} request={r} />)}
        </div>
      </div>
    </AppShell>
  );
}
