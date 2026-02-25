"use client";
import { AppShell } from "@/components/AppShell";
import { agencyNav } from "@/app/agency/page";
import { useState } from "react";
import { createRequest } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { GuideType } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function NewGuideRequest() {
  const router = useRouter();
  const [guideType, setGuideType] = useState<GuideType>("FD");
  const [date, setDate] = useState("");
  const [hotel, setHotel] = useState("");
  const [pax, setPax] = useState(1);
  const [lang, setLang] = useState("EN");
  const [notes, setNotes] = useState("");
  const [priceTry, setPriceTry] = useState(0);
  const [loading, setLoading] = useState(false);

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
              pax,
              lang,
              notes,
              priceTry,
            } as any);
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
            <input className="input mt-1" value={hotel} onChange={(e)=>setHotel(e.target.value)} required />
          </label>

          <label className="block">
            <div className="label">Pax</div>
            <input className="input mt-1" type="number" min={1} value={pax} onChange={(e)=>setPax(parseInt(e.target.value||"1",10))} required />
          </label>

          <label className="block">
            <div className="label">Language</div>
            <select className="input mt-1" value={lang} onChange={(e)=>setLang(e.target.value)}>
              {["EN","RU","IT","ES","AR","CH"].map(x=><option key={x} value={x}>{x}</option>)}
            </select>
          </label>

          <label className="block md:col-span-2">
            <div className="label">Notes</div>
            <textarea className="input mt-1 min-h-[110px]" value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder="Any extra details" />
          </label>

          <label className="block">
            <div className="label">Price TRY</div>
            <input className="input mt-1" type="number" min={0} value={priceTry} onChange={(e)=>setPriceTry(parseInt(e.target.value||"0",10))} required />
          </label>

          <div className="flex items-end">
            <button className="glass-btn w-full" type="submit" disabled={loading}>{loading ? "Publishing..." : "Publish"}</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
