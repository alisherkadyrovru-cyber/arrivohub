"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequestCard } from "@/components/RequestCard";
import { agencyNav } from "@/app/agency/page";
import { listRequests } from "@/lib/repo";
import type { Request } from "@/lib/types";

export default function Archive() {
  const [requests,setRequests]=useState<Request[]>([]);
  useEffect(()=>{ listRequests({ status:"archived" }).then(setRequests); },[]);
  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p)=>p.fullName} rightSlot={(p)=><span className="chip">Credits: {p.credits ?? 0}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Archived requests</div>
        <div className="space-y-3">
          {requests.length===0 ? <div className="text-sm text-white/75">Archive is empty.</div> : requests.map(r=><RequestCard key={r.id} request={r} />)}
        </div>
      </div>
    </AppShell>
  );
}
