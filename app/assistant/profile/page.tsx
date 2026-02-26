"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { assistantNav } from "@/lib/nav";
import { getCurrentProfile } from "@/lib/session";
export default function Profile() {
  const [p,setP]=useState<any>(null);
  useEffect(()=>{ getCurrentProfile().then(setP); },[]);
  return (
    <AppShell role="assistant" navItems={assistantNav as any} centerTitle={(p)=>p.fullName} rightSlot={(p)=><span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Profile</div>
        <div className="glass-soft p-4 text-sm">
          <div><span className="muted">Cabinet ID:</span> {p?.cabinetId ?? "—"}</div>
          <div className="mt-1"><span className="muted">Name:</span> {p?.fullName ?? "—"}</div>
          <div className="mt-1"><span className="muted">Email:</span> {p?.email ?? "—"}</div>
          <div className="mt-1"><span className="muted">Phone:</span> {p?.phone ?? "—"}</div>
          <div className="mt-1"><span className="muted">Address:</span> {p?.address ?? "—"}</div>
        </div>
      </div>
    </AppShell>
  );
}
