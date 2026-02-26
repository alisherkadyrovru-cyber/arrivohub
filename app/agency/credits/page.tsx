"use client";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { agencyNav } from "@/lib/nav";
import { listCreditsLedger, uploadReceipt } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

export default function Credits() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      setProfile(p);
      if (p) setLedger(await listCreditsLedger(p.id));
    })();
  }, []);

  async function handleUpload() {
    if (!file || !profile) return;
    const amt = parseInt(amount, 10);
    if (isNaN(amt) || amt <= 0) { alert("Enter the amount you paid."); return; }
    setUploading(true);
    try {
      await uploadReceipt({
        profileId: profile.id,
        cabinetId: profile.cabinetId ?? "—",
        fileName: file.name,
        type: "credits",
        amount: amt,
      });
      setSuccess(true);
      setFile(null);
      setAmount("");
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Credits: {p.credits ?? 0}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Credits</div>

        {/* Top-up instructions */}
        <div className="glass-soft p-4 space-y-2 text-sm">
          <div className="font-semibold">Top-up instructions</div>
          <div className="text-white/70 text-xs space-y-1">
            <div>Transfer payment to the following bank account and write your Cabinet ID in the comment:</div>
            <div className="mt-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 space-y-1 font-mono text-xs">
              <div><span className="text-white/50">Account holder:</span> ArrivoHub Platform Ltd.</div>
              <div><span className="text-white/50">IBAN:</span> TR00 0001 0002 0003 0004 0005 06</div>
              <div><span className="text-white/50">Your Cabinet ID:</span> {profile?.cabinetId ?? "—"}</div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="glass-soft p-4">
          <div className="text-sm font-semibold">Pricing</div>
          <div className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2"><span>100 credits</span><span>1 000 TRY</span></div>
            <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2"><span>200 credits</span><span>1 800 TRY</span></div>
          </div>
        </div>

        {/* Upload receipt */}
        <div className="glass-soft p-4 space-y-3 text-sm">
          <div className="font-semibold">Upload payment receipt</div>
          {success ? (
            <div className="rounded-xl border border-emerald-200/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              Receipt uploaded successfully. Our team will process it shortly.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="number" className="input w-36" placeholder="Amount (TRY)" min={1}
                  value={amount} onChange={e => setAmount(e.target.value)}
                />
                <label className="glass-btn cursor-pointer text-xs">
                  {file ? file.name : "Choose file"}
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files?.[0] ?? null)} />
                </label>
                <button className="glass-btn text-xs" type="button" onClick={handleUpload} disabled={uploading || !file}>
                  {uploading ? "Uploading..." : "Upload receipt"}
                </button>
              </div>
              <div className="text-xs text-white/40">Accepted: PDF, JPG, PNG</div>
            </>
          )}
        </div>

        {/* Ledger */}
        <div className="glass-soft p-4">
          <div className="text-sm font-semibold">Ledger</div>
          <div className="mt-3 space-y-2 text-xs">
            {ledger.length === 0 ? (
              <div className="text-white/70">No records.</div>
            ) : ledger.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                <div className="space-y-0.5">
                  <div>{r.note}</div>
                  <div className="text-white/40">{fmtDate(r.createdAt)}</div>
                </div>
                <span className={r.delta >= 0 ? "text-emerald-100 font-semibold" : "text-red-100 font-semibold"}>
                  {r.delta >= 0 ? `+${r.delta}` : r.delta}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
