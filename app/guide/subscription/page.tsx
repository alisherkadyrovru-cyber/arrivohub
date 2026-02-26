"use client";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { guideNav } from "@/lib/nav";
import { uploadReceipt, listSubscriptionPayments } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { SubscriptionPayment } from "@/lib/types";

const PRICING = [
  { label: "14 days", days: 14, price: 1000 },
  { label: "1 month", days: 30, price: 1800 },
  { label: "3 months", days: 90, price: 5000 },
];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

export default function Subscription() {
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<SubscriptionPayment[]>([]);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const p = await getCurrentProfile();
      setProfile(p);
      if (p) setHistory(await listSubscriptionPayments(p.id));
    })();
  }, []);

  const selectedPlan = PRICING.find(p => p.days === selectedDays);

  async function handleUpload() {
    if (!file || !profile || !selectedPlan) return;
    setUploading(true);
    try {
      await uploadReceipt({
        profileId: profile.id,
        cabinetId: profile.cabinetId ?? "—",
        fileName: file.name,
        type: "subscription",
        amount: selectedPlan.price,
      });
      setSuccess(true);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <AppShell role="guide" navItems={guideNav as any} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Sub until: {p.expiresAt ?? "—"}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Subscription</div>

        <div className="glass-soft p-4 space-y-2 text-sm">
          <div className="font-semibold">Payment instructions</div>
          <div className="text-white/70 text-xs space-y-1">
            <div>Transfer payment to the following bank account and write your Cabinet ID in the comment:</div>
            <div className="mt-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 space-y-1 font-mono text-xs">
              <div><span className="text-white/50">Account holder:</span> ArrivoHub Platform Ltd.</div>
              <div><span className="text-white/50">IBAN:</span> TR00 0001 0002 0003 0004 0005 06</div>
              <div><span className="text-white/50">Your Cabinet ID:</span> {profile?.cabinetId ?? "—"}</div>
            </div>
          </div>
        </div>

        <div className="glass-soft p-4">
          <div className="text-sm font-semibold">Pricing — select your plan</div>
          <div className="mt-3 grid gap-2 text-sm">
            {PRICING.map(plan => (
              <label key={plan.days} className={"flex items-center justify-between rounded-xl border px-3 py-2 cursor-pointer transition " + (selectedDays === plan.days ? "border-white/40 bg-white/15" : "border-white/15 bg-white/5 hover:bg-white/10")}>
                <div className="flex items-center gap-2">
                  <input type="radio" name="plan" className="accent-white" checked={selectedDays === plan.days} onChange={() => setSelectedDays(plan.days)} />
                  {plan.label}
                </div>
                <span>{plan.price.toLocaleString("tr-TR")} TRY</span>
              </label>
            ))}
          </div>
        </div>

        <div className="glass-soft p-4 space-y-3 text-sm">
          <div className="font-semibold">Upload payment receipt</div>
          {success ? (
            <div className="rounded-xl border border-emerald-200/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              Receipt uploaded successfully. Our team will activate your subscription shortly.
            </div>
          ) : (
            <>
              {!selectedPlan && <div className="text-xs text-amber-100/70">Please select a plan above first.</div>}
              <div className="flex flex-wrap gap-2 items-center">
                <label className={"glass-btn cursor-pointer text-xs " + (!selectedPlan ? "opacity-50 pointer-events-none" : "")}>
                  {file ? file.name : "Choose file"}
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files?.[0] ?? null)} disabled={!selectedPlan} />
                </label>
                <button className="glass-btn text-xs" type="button" onClick={handleUpload} disabled={uploading || !file || !selectedPlan}>
                  {uploading ? "Uploading..." : "Upload receipt"}
                </button>
              </div>
              <div className="text-xs text-white/40">Accepted: PDF, JPG, PNG</div>
            </>
          )}
        </div>

        <div className="glass-soft p-4">
          <div className="text-sm font-semibold">Payment History</div>
          <div className="mt-3 space-y-2 text-xs">
            {history.length === 0 ? (
              <div className="text-white/70">No payment records.</div>
            ) : history.map(h => (
              <div key={h.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                <span>Subscription payment for {h.days} days</span>
                <span className="text-white/70">{h.priceTry.toLocaleString("tr-TR")} TRY</span>
                <span className="text-white/50">{fmtDate(h.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
