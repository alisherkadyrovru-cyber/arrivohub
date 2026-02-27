"use client";
import { AppShell } from "@/components/AppShell";
import { agencyNav } from "@/lib/nav";
import { useEffect, useState } from "react";
import { createRequest } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { GuideType } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function NewGuideRequest() {
  const router = useRouter();
  const [agencyId, setAgencyId] = useState("");
  const [guideType, setGuideType] = useState<GuideType>("FD");
  const [date, setDate] = useState("");
  const [hotel, setHotel] = useState("");
  const [pax, setPax] = useState<number | "">("");
  const [lang, setLang] = useState("EN");
  const [notes, setNotes] = useState("");
  const [priceTry, setPriceTry] = useState<number | "">("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentProfile().then(p => { if (p) setAgencyId(p.id); });
  }, []);

  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p)=>p.fullName} rightSlot={(p)=><span className="chip">Credits: {p.credits ?? 0}</span>}>
      <div className="space-y-4">
        <div className="text-lg font-semibold">Create request — Guide (Tour)</div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={async(e)=>{
          e.preventDefault(); setLoading(true);
          try {
            const profile = await getCurrentProfile();
            await createRequest({
              kind:"guide",
              agencyName: profile?.fullName ?? "Agency",
              guideType,
              date,
              hotel,
              pax: Number(pax) || 1,
              lang,
              notes,
              priceTry: Number(priceTry) || 0,
              onlyFavorites,
            } as any, agencyId || profile?.id);
            router.push("/agency/requests/pending");
          } finally { setLoading(false); }
        }}>
          <label className="block">
            <div className="label">Type</div>
            <select className="input mt-1" value={guideType} onChange={(e)=>setGuideType(e.target.value as any)}>
              <option value="FD">FD (Fullday)</option>
              <option value="FD+Night">FD + Night</option>
              <option value="A Few Days">A Few Days</option>
            </select>
          </label>

          <label className="block">
            <div className="label">Date</div>
            <input className="input mt-1" type="date" value={date} onChange={(e)=>setDate(e.target.value)} required />
          </label>

          <label className="block md:col-span-2">
            <div className="label">Hotel</div>
            <input className="input mt-1" value={hotel} maxLength={100} onChange={(e)=>setHotel(e.target.value)} required />
          </label>

          <label className="block">
            <div className="label">Pax</div>
            <input className="input mt-1" type="number" min={1} value={pax} placeholder="e.g. 3" onChange={(e)=>setPax(e.target.value === "" ? "" : parseInt(e.target.value, 10))} required />
          </label>

          <label className="block">
            <div className="label">Language</div>
            <select className="input mt-1" value={lang} onChange={(e)=>setLang(e.target.value)}>
              {["EN","RU","IT","ES","AR","CH"].map(x=><option key={x} value={x}>{x}</option>)}
            </select>
          </label>

          <label className="block md:col-span-2">
            <div className="label">Notes</div>
            <textarea className="input mt-1 min-h-[110px]" value={notes} maxLength={1000} onChange={(e)=>setNotes(e.target.value)} placeholder="Any extra details" />
          </label>

          <label className="block">
            <div className="label">Price TRY</div>
            <input className="input mt-1" type="number" min={0} value={priceTry} placeholder="e.g. 5000" onChange={(e)=>setPriceTry(e.target.value === "" ? "" : parseInt(e.target.value, 10))} required />
          </label>

          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none flex-1">
              <div
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${onlyFavorites ? "bg-white/40" : "bg-white/15"}`}
                onClick={() => setOnlyFavorites(v => !v)}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${onlyFavorites ? "translate-x-6" : "translate-x-1"}`} />
              </div>
              <span className="text-white/80">Only my favorites</span>
            </label>
            <button className="glass-btn" type="submit" disabled={loading}>{loading ? "Publishing..." : "Publish"}</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
