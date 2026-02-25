"use client";
import { useMemo, useState } from "react";
import type { Application, Request } from "@/lib/types";

function fmtPrice(n:number){ return `${n.toLocaleString("tr-TR")} TRY`; }

export function RequestCard({ request, children }:{ request:Request; children?:React.ReactNode }) {
  const [open,setOpen]=useState(false);
  const line1 = useMemo(() => request.kind==="assistant"
    ? `${request.assistType} | ${request.adType} | ${request.airport ?? "—"} | ${request.hotel} | ${fmtPrice(request.priceTry)}`
    : `Guide | ${request.guideType} | ${request.hotel} | ${fmtPrice(request.priceTry)}`
  , [request]);
  const line2 = useMemo(() => request.kind==="assistant"
    ? `${request.date} | ${request.time ?? "—"} | ${request.flightCode ?? "—"} | ${request.pax} pax |`
    : `${request.date} | ${request.pax} pax |`
  , [request]);

  return (
    <div className="glass-soft p-4">
      <button type="button" className="w-full text-left" onClick={() => setOpen(v=>!v)}>
        <div className="text-sm font-semibold">{request.agencyName}</div>
        <div className="mt-1 text-sm">{line1}</div>
        <div className="mt-1 text-xs text-white/75">{line2} {request.lang} |</div>
      </button>
      {open ? (
        <div className="mt-3 space-y-3">
          <div className="text-xs text-white/80"><span className="font-semibold">Notes:</span> {request.notes ?? "—"}</div>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function ApplicantsList({ applications, selectedId, onSelect, onApplicantClick }: {
  applications: Application[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApplicantClick?: (applicantId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {applications.length === 0 ? (
        <div className="text-xs text-white/70">No applicants yet.</div>
      ) : (
        applications.map((a) => (
          <div key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedId === a.id}
                onChange={() => onSelect(a.id)}
                className="h-4 w-4 accent-white flex-shrink-0"
              />
              <button
                type="button"
                className="text-sm text-left hover:underline hover:text-white transition"
                onClick={() => onApplicantClick?.(a.applicantId)}
              >
                {a.applicantName}
              </button>
            </div>
            <span className="text-sm flex-shrink-0 text-white/85">
              {a.offerTry === null ? "— (listed price)" : `${a.offerTry.toLocaleString("tr-TR")} TRY`}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
