"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { useLang } from "@/components/ClientProviders";
import { registerUser, confirmRegistration } from "@/lib/repo";

const LANGUAGES = ["English","Arabic","Bulgarian","Chinese","French","German","Greek","Persian","Italian","Russian","Spanish"];
const LEVELS = ["A1","A2","B1","B2","C1","C2"];

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one digit.";
  return null;
}

export default function RegisterGuide() {
  const { lang, onLang } = useLang();
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "", dateOfBirth: "", gender: "" as "Male"|"Female"|"",
    kokartId: "", phone: "+90 ", email: "", password: "", repeatPassword: "",
  });
  const [langs, setLangs] = useState([
    { lang: "", level: "" }, { lang: "", level: "" }, { lang: "", level: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }
  function setLang(i: number, k: "lang"|"level", v: string) {
    setLangs(prev => prev.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.fullName.trim()) { setError("Name is required."); return; }
    if (!form.gender) { setError("Please select gender."); return; }
    const pwErr = validatePassword(form.password);
    if (pwErr) { setError(pwErr); return; }
    if (form.password !== form.repeatPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const selectedLangs = langs.filter(l => l.lang && l.level);
    try {
      const t = await registerUser({
        role: "guide",
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender as "Male"|"Female",
        kokartId: form.kokartId || undefined,
        languages: selectedLangs,
        password: form.password,
      } as any);
      setToken(t);
    } catch (err: any) {
      setError(err?.message ?? "Registration error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!token) return;
    setConfirming(true);
    try {
      await confirmRegistration(token);
      router.push("/?registered=1");
    } catch (err: any) {
      setError(err?.message ?? "Confirmation error.");
      setConfirming(false);
    }
  }

  return (
    <div className="min-h-screen pb-12">
      <TopBar lang={lang} onLang={onLang} />
      <Header />
      <div className="mx-auto mt-8 max-w-lg px-4">
        <div className="glass p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Create Guide Account</div>
            <span className="chip">GUIDE</span>
          </div>

          {token ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                A verification email has been sent to <span className="font-semibold">{form.email}</span>.<br />
                Please check your inbox and follow the link to confirm your account.
              </div>
              <div className="rounded-xl border border-amber-200/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                <div className="font-semibold mb-2">Demo mode: instant confirmation</div>
                <button className="glass-btn" type="button" onClick={handleConfirm} disabled={confirming}>
                  {confirming ? "Confirming..." : "Confirm & activate account"}
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <div className="label">Name Surname *</div>
                <input className="input mt-1" value={form.fullName} onChange={e => set("fullName", e.target.value)} required />
              </label>
              <label className="block">
                <div className="label">Date of Birth *</div>
                <input className="input mt-1" type="date" value={form.dateOfBirth} onChange={e => set("dateOfBirth", e.target.value)} required />
              </label>
              <div>
                <div className="label mb-2">Gender *</div>
                <div className="flex gap-4 text-sm">
                  {(["Male","Female"] as const).map(g => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="gender" className="accent-white" checked={form.gender === g} onChange={() => set("gender", g)} />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
              <label className="block">
                <div className="label">Kokart ID Number</div>
                <input className="input mt-1" value={form.kokartId} onChange={e => set("kokartId", e.target.value)} placeholder="KOK-XXXXX" />
              </label>
              <label className="block">
                <div className="label">Mobile Number *</div>
                <input className="input mt-1" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+90 123 456 78 90" required />
              </label>
              <div>
                <div className="label mb-2">Languages you know</div>
                <div className="space-y-2">
                  {langs.map((row, i) => (
                    <div key={i} className="flex gap-2">
                      <select className="input flex-1" value={row.lang} onChange={e => setLang(i, "lang", e.target.value)}>
                        <option value="">Language {i+1}</option>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <select className="input w-24" value={row.level} onChange={e => setLang(i, "level", e.target.value)}>
                        <option value="">Level</option>
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <label className="block">
                <div className="label">Email Address *</div>
                <input className="input mt-1" type="email" value={form.email} onChange={e => set("email", e.target.value)} required />
              </label>
              <label className="block">
                <div className="label">Password *</div>
                <input className="input mt-1" type="password" value={form.password} onChange={e => set("password", e.target.value)} required />
                <div className="mt-1 text-xs text-white/50">Min. 8 characters, 1 uppercase letter, 1 digit.</div>
              </label>
              <label className="block">
                <div className="label">Repeat Password *</div>
                <input className="input mt-1" type="password" value={form.repeatPassword} onChange={e => set("repeatPassword", e.target.value)} required />
              </label>
              {error && <div className="rounded-xl border border-red-200/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">{error}</div>}
              <button className="glass-btn w-full" type="submit" disabled={loading}>{loading ? "..." : "Create"}</button>
              <div className="text-center text-xs text-white/50">
                Already have an account? <Link href="/" className="underline">Sign in</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
