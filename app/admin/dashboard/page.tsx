"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminAuthenticated, signOutAdmin } from "@/lib/session";
import {
  adminGetAllUsers, adminTopUpCredits, adminExtendSubscription, adminDeleteUser,
  adminGetAllRequests, listReceiptUploads, markReceiptProcessed,
} from "@/lib/repo";
import type { Profile, Request, ReceiptUpload } from "@/lib/types";

type Tab = "agencies" | "assistants" | "guides" | "receipts" | "requests";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("agencies");
  const [users, setUsers] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [receipts, setReceipts] = useState<ReceiptUpload[]>([]);
  const [topupInputs, setTopupInputs] = useState<Record<string, string>>({});
  const [daysInputs, setDaysInputs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAdminAuthenticated()) { router.replace("/admin"); return; }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const [u, r, rc] = await Promise.all([adminGetAllUsers(), adminGetAllRequests(), listReceiptUploads()]);
    setUsers(u); setRequests(r); setReceipts(rc);
  }

  function setFb(id: string, msg: string) {
    setFeedback(p => ({ ...p, [id]: msg }));
    setTimeout(() => setFeedback(p => { const n = { ...p }; delete n[id]; return n; }), 3000);
  }

  async function topUp(agencyId: string) {
    const n = parseInt(topupInputs[agencyId] ?? "", 10);
    if (isNaN(n) || n <= 0) { setFb(agencyId, "Enter a valid amount."); return; }
    await adminTopUpCredits(agencyId, n);
    setTopupInputs(p => ({ ...p, [agencyId]: "" }));
    setFb(agencyId, `+${n} credits added.`);
    await load();
  }

  async function extend(userId: string) {
    const n = parseInt(daysInputs[userId] ?? "", 10);
    if (isNaN(n) || n <= 0) { setFb(userId, "Enter valid days."); return; }
    await adminExtendSubscription(userId, n);
    setDaysInputs(p => ({ ...p, [userId]: "" }));
    setFb(userId, `+${n} days added.`);
    await load();
  }

  async function deleteUser(userId: string) {
    await adminDeleteUser(userId);
    await load();
  }

  async function processReceipt(id: string) {
    await markReceiptProcessed(id);
    await load();
  }

  const agencies = users.filter(u => u.role === "agency");
  const assistants = users.filter(u => u.role === "assistant");
  const guides = users.filter(u => u.role === "guide");

  const tabCls = (t: Tab) =>
    "px-4 py-2 text-sm rounded-xl transition " +
    (tab === t ? "bg-white/15 border border-white/25" : "hover:bg-white/10 text-white/70");

  return (
    <div className="min-h-screen pb-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="glass flex items-center justify-between px-5 py-4 mt-4">
          <div className="text-lg font-semibold">ArrivoHub — Admin</div>
          <button className="glass-btn text-xs" type="button" onClick={() => { signOutAdmin(); router.push("/admin"); }}>
            Logout
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["agencies","assistants","guides","receipts","requests"] as Tab[]).map(t => (
            <button key={t} className={tabCls(t)} type="button" onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-4 glass p-5">

          {/* ── AGENCIES ── */}
          {tab === "agencies" && (
            <div className="space-y-3">
              <div className="text-sm font-semibold">Agencies ({agencies.length})</div>
              {agencies.length === 0 && <div className="text-sm text-white/60">No agencies.</div>}
              {agencies.map(u => (
                <div key={u.id} className="glass-soft p-3 rounded-xl text-sm space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="chip text-xs">{u.cabinetId ?? "—"}</span>
                    <span className="font-semibold">{u.fullName}</span>
                    <span className="text-white/60">{u.email}</span>
                    <span className="ml-auto font-semibold">{u.credits ?? 0} credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" className="input w-28" placeholder="+ credits" min={1}
                      value={topupInputs[u.id] ?? ""}
                      onChange={e => setTopupInputs(p => ({ ...p, [u.id]: e.target.value }))} />
                    <button className="glass-btn text-xs" type="button" onClick={() => topUp(u.id)}>Top up</button>
                    <button className="glass-btn text-xs text-red-200 border-red-200/30 ml-auto" type="button"
                      onClick={() => { if (confirm(`Delete ${u.fullName}?`)) deleteUser(u.id); }}>Delete</button>
                  </div>
                  {feedback[u.id] && <div className="text-xs text-emerald-100">{feedback[u.id]}</div>}
                </div>
              ))}
            </div>
          )}

          {/* ── ASSISTANTS ── */}
          {tab === "assistants" && (
            <div className="space-y-3">
              <div className="text-sm font-semibold">Assistants ({assistants.length})</div>
              {assistants.length === 0 && <div className="text-sm text-white/60">No assistants.</div>}
              {assistants.map(u => (
                <div key={u.id} className="glass-soft p-3 rounded-xl text-sm space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="chip text-xs">{u.cabinetId ?? "—"}</span>
                    <span className="font-semibold">{u.fullName}</span>
                    <span className="text-white/60">{u.email}</span>
                    <span className="ml-auto text-white/70">Sub until: {u.expiresAt ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" className="input w-28" placeholder="+ days" min={1}
                      value={daysInputs[u.id] ?? ""}
                      onChange={e => setDaysInputs(p => ({ ...p, [u.id]: e.target.value }))} />
                    <button className="glass-btn text-xs" type="button" onClick={() => extend(u.id)}>Extend sub</button>
                    <button className="glass-btn text-xs text-red-200 border-red-200/30 ml-auto" type="button"
                      onClick={() => { if (confirm(`Delete ${u.fullName}?`)) deleteUser(u.id); }}>Delete</button>
                  </div>
                  {feedback[u.id] && <div className="text-xs text-emerald-100">{feedback[u.id]}</div>}
                </div>
              ))}
            </div>
          )}

          {/* ── GUIDES ── */}
          {tab === "guides" && (
            <div className="space-y-3">
              <div className="text-sm font-semibold">Guides ({guides.length})</div>
              {guides.length === 0 && <div className="text-sm text-white/60">No guides.</div>}
              {guides.map(u => (
                <div key={u.id} className="glass-soft p-3 rounded-xl text-sm space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="chip text-xs">{u.cabinetId ?? "—"}</span>
                    <span className="font-semibold">{u.fullName}</span>
                    <span className="text-white/60">{u.email}</span>
                    <span className="ml-auto text-white/70">Sub until: {u.expiresAt ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" className="input w-28" placeholder="+ days" min={1}
                      value={daysInputs[u.id] ?? ""}
                      onChange={e => setDaysInputs(p => ({ ...p, [u.id]: e.target.value }))} />
                    <button className="glass-btn text-xs" type="button" onClick={() => extend(u.id)}>Extend sub</button>
                    <button className="glass-btn text-xs text-red-200 border-red-200/30 ml-auto" type="button"
                      onClick={() => { if (confirm(`Delete ${u.fullName}?`)) deleteUser(u.id); }}>Delete</button>
                  </div>
                  {feedback[u.id] && <div className="text-xs text-emerald-100">{feedback[u.id]}</div>}
                </div>
              ))}
            </div>
          )}

          {/* ── RECEIPTS ── */}
          {tab === "receipts" && (
            <div className="space-y-3">
              <div className="text-sm font-semibold">Uploaded Receipts ({receipts.length})</div>
              {receipts.length === 0 && <div className="text-sm text-white/60">No receipts yet.</div>}
              {receipts.map(r => (
                <div key={r.id} className={"glass-soft p-3 rounded-xl text-sm flex flex-wrap items-center gap-3 " + (r.processed ? "opacity-60" : "")}>
                  <span className="chip text-xs">{r.cabinetId}</span>
                  <span className="capitalize text-white/70">{r.type}</span>
                  <span className="font-semibold">{r.amount.toLocaleString("tr-TR")} TRY</span>
                  <span className="text-white/60 truncate max-w-[180px]">{r.fileName}</span>
                  <span className="text-white/50">{fmtDate(r.createdAt)}</span>
                  {r.processed
                    ? <span className="ml-auto chip border-emerald-200/30 bg-emerald-500/10 text-emerald-100 text-xs">Processed</span>
                    : <button className="glass-btn text-xs ml-auto" type="button" onClick={() => processReceipt(r.id)}>Mark processed</button>
                  }
                </div>
              ))}
            </div>
          )}

          {/* ── REQUESTS ── */}
          {tab === "requests" && (
            <div className="space-y-3">
              <div className="text-sm font-semibold">All Requests ({requests.length})</div>
              {requests.length === 0 && <div className="text-sm text-white/60">No requests.</div>}
              {requests.map(r => (
                <div key={r.id} className="glass-soft p-3 rounded-xl text-sm flex flex-wrap items-center gap-3">
                  <span className="chip text-xs">{r.id}</span>
                  <span className="capitalize text-white/70">{r.kind}</span>
                  <span className="font-semibold">{r.agencyName}</span>
                  <span className="text-white/60">{r.date}{r.time ? ` ${r.time}` : ""}</span>
                  <span className={"chip text-xs " + (r.status === "open" ? "bg-sky-500/20 border-sky-200/30 text-sky-100" : r.status === "confirmed" ? "bg-emerald-500/20 border-emerald-200/30 text-emerald-100" : "bg-white/10")}>{r.status}</span>
                  {(r as any).confirmedApplicantName && (
                    <span className="text-white/70 text-xs">→ {(r as any).confirmedApplicantName}</span>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
