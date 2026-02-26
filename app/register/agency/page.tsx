"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { useLang } from "@/components/ClientProviders";
import { registerUser, confirmRegistration } from "@/lib/repo";

function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must contain at least one digit.";
  return null;
}

export default function RegisterAgency() {
  const { lang, onLang } = useLang();
  const router = useRouter();
  const [form, setForm] = useState({ agencyName: "", tursabLicense: "", vatNumber: "", phone: "+90 ", email: "", password: "", repeatPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.agencyName.trim()) { setError("Agency name is required."); return; }
    if (!form.tursabLicense.trim()) { setError("Tursab License Number is required."); return; }
    const pwErr = validatePassword(form.password);
    if (pwErr) { setError(pwErr); return; }
    if (form.password !== form.repeatPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const t = await registerUser({
        role: "agency",
        fullName: form.agencyName,
        email: form.email,
        phone: form.phone,
        tursabLicense: form.tursabLicense,
        vatNumber: form.vatNumber,
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
            <div className="text-lg font-semibold">Create Agency Account</div>
            <span className="chip">AGENCY</span>
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
                <div className="label">Agency Name *</div>
                <input className="input mt-1" value={form.agencyName} onChange={e => set("agencyName", e.target.value)} required />
              </label>
              <label className="block">
                <div className="label">Tursab License Number *</div>
                <input className="input mt-1" value={form.tursabLicense} onChange={e => set("tursabLicense", e.target.value)} required />
              </label>
              <label className="block">
                <div className="label">VAT Number</div>
                <input className="input mt-1" value={form.vatNumber} onChange={e => set("vatNumber", e.target.value)} />
              </label>
              <label className="block">
                <div className="label">Telephone Number *</div>
                <input className="input mt-1" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+90 123 456 78 90" required />
              </label>
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
