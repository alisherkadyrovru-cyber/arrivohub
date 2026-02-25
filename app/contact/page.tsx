"use client";
import { Header } from "@/components/Header";
import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/GlassCard";
import { useLang } from "@/components/ClientProviders";
import { useState } from "react";
export default function ContactPage() {
  const { lang, onLang } = useLang();
  const [sent,setSent]=useState(false);
  return (
    <div className="min-h-screen pb-12">
      <TopBar lang={lang} onLang={onLang} />
      <Header />
      <div className="mx-auto mt-8 max-w-3xl px-4">
        <GlassCard>
          <h1 className="text-2xl font-semibold">Contact Support</h1>
          <p className="mt-2 text-sm text-white/75">UI-only for now. We will connect backend later.</p>
          {sent ? (
            <div className="mt-4 rounded-xl border border-emerald-200/20 bg-emerald-500/10 px-4 py-3 text-sm">Sent ✅ (demo)</div>
          ) : (
            <form className="mt-6 space-y-3" onSubmit={(e)=>{e.preventDefault(); setSent(true);}}>
              <label className="block">
                <div className="label">Your email</div>
                <input className="input mt-1" type="email" required />
              </label>
              <label className="block">
                <div className="label">Message</div>
                <textarea className="input mt-1 min-h-[120px]" required />
              </label>
              <button className="glass-btn" type="submit">Send</button>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
