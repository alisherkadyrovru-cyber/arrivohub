"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { agencyNav } from "@/app/agency/page";
import { getRequestById, updateRequest, updateConfirmedRequest } from "@/lib/repo";
import type { ADType, AssistType, GuideType, Request } from "@/lib/types";

export default function ChangeDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const requestId = params.requestId as string;
  const from = searchParams.get("from") ?? "pending"; // "pending" | "confirmed"

  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // assistant fields
  const [assistType, setAssistType] = useState<AssistType>("Greeter");
  const [adType, setAdType] = useState<ADType>("Arrival");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [flightCode, setFlightCode] = useState("");
  const [airport, setAirport] = useState("");
  const [hotel, setHotel] = useState("");
  const [pax, setPax] = useState(1);
  const [lang, setLang] = useState("EN");
  const [notes, setNotes] = useState("");
  const [priceTry, setPriceTry] = useState(0);

  // guide-only fields
  const [guideType, setGuideType] = useState<GuideType>("FD");

  useEffect(() => {
    getRequestById(requestId).then(r => {
      if (!r) { router.push("/agency"); return; }
      setRequest(r);
      setDate(r.date);
      setHotel(r.hotel);
      setPax(r.pax);
      setLang(r.lang);
      setNotes(r.notes ?? "");
      setPriceTry(r.priceTry);
      if (r.kind === "assistant") {
        setAssistType(r.assistType);
        setAdType(r.adType);
        setTime(r.time ?? "");
        setFlightCode(r.flightCode ?? "");
        setAirport(r.airport ?? "");
      } else {
        setGuideType(r.guideType);
      }
      setLoading(false);
    });
  }, [requestId, router]);

  if (loading) return null;
  if (!request) return null;

  const airportEnabled = request.kind === "assistant" && adType !== "Other";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const patch: any = { date, hotel, pax, lang, notes, priceTry };
      if (request!.kind === "assistant") {
        patch.assistType = assistType;
        patch.adType = adType;
        patch.time = time;
        patch.flightCode = airportEnabled ? flightCode : undefined;
        patch.airport = airportEnabled ? airport : undefined;
      } else {
        patch.guideType = guideType;
      }

      if (from === "confirmed") {
        await updateConfirmedRequest(requestId, patch);
        router.push("/agency/requests/confirmed");
      } else {
        await updateRequest(requestId, patch);
        router.push("/agency/requests/pending");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Credits: {p.credits ?? 0}</span>}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button className="glass-btn px-2 py-1 text-xs" type="button" onClick={() => router.back()}>← Back</button>
          <div className="text-lg font-semibold">Change details</div>
        </div>

        {from === "pending" && (
          <div className="glass-soft p-3 text-sm text-amber-100 border border-amber-200/20 bg-amber-500/10 rounded-xl">
            Saving will republish this request. All current applicants will be removed and the request will go back to the feed.
          </div>
        )}
        {from === "confirmed" && (
          <div className="glass-soft p-3 text-sm text-amber-100 border border-amber-200/20 bg-amber-500/10 rounded-xl">
            The confirmed person will be notified about the updated details and must Accept or Refuse them.
          </div>
        )}

        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          {request.kind === "assistant" && (
            <>
              <label className="block">
                <div className="label">Type</div>
                <select className="input mt-1" value={assistType} onChange={e => setAssistType(e.target.value as AssistType)}>
                  <option value="Greeter">Greeter (meet & greet)</option>
                  <option value="Assistant">Assistant (airport ↔ hotel)</option>
                </select>
              </label>
              <label className="block">
                <div className="label">Arrival / Departure / Other</div>
                <select className="input mt-1" value={adType} onChange={e => setAdType(e.target.value as ADType)}>
                  <option value="Arrival">Arrival</option>
                  <option value="Departure">Departure</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block">
                <div className="label">Time</div>
                <input className="input mt-1" type="time" value={time} onChange={e => setTime(e.target.value)} />
              </label>
              <label className="block">
                <div className="label">Flight code</div>
                <input className="input mt-1" value={flightCode} onChange={e => setFlightCode(e.target.value)} disabled={!airportEnabled} />
              </label>
              <label className="block">
                <div className="label">Airport</div>
                <input className="input mt-1" value={airport} onChange={e => setAirport(e.target.value)} disabled={!airportEnabled} />
              </label>
            </>
          )}

          {request.kind === "guide" && (
            <label className="block">
              <div className="label">Type</div>
              <select className="input mt-1" value={guideType} onChange={e => setGuideType(e.target.value as GuideType)}>
                <option value="FD">FD (Fullday)</option>
                <option value="FD+Night">FD + Night</option>
                <option value="A Few Days">A Few Days</option>
              </select>
            </label>
          )}

          <label className="block">
            <div className="label">Date</div>
            <input className="input mt-1" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </label>

          <label className="block md:col-span-2">
            <div className="label">Hotel</div>
            <input className="input mt-1" value={hotel} onChange={e => setHotel(e.target.value)} required />
          </label>

          <label className="block">
            <div className="label">Pax</div>
            <input className="input mt-1" type="number" min={1} value={pax} onChange={e => setPax(parseInt(e.target.value || "1", 10))} required />
          </label>

          <label className="block">
            <div className="label">Language</div>
            <select className="input mt-1" value={lang} onChange={e => setLang(e.target.value)}>
              {["EN", "RU", "IT", "ES", "AR", "CH"].map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>

          <label className="block md:col-span-2">
            <div className="label">Notes</div>
            <textarea className="input mt-1 min-h-[100px]" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any extra details" />
          </label>

          <label className="block">
            <div className="label">Price TRY</div>
            <input className="input mt-1" type="number" min={0} value={priceTry} onChange={e => setPriceTry(parseInt(e.target.value || "0", 10))} required />
          </label>

          <div className="flex items-end">
            <button className="glass-btn w-full" type="submit" disabled={saving}>
              {saving ? "Saving..." : from === "confirmed" ? "Save & notify" : "Save & republish"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
