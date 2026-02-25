"use client";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/GlassCard";
import { useLang } from "@/components/ClientProviders";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { signIn } from "@/lib/session";
import { tr } from "@/lib/i18n";
import { useState } from "react";
import type { Role } from "@/lib/types";

function RoleLoginCard({
  role, title, bullets, onDone
}:{
  role: Exclude<Role,"admin">;
  title: string;
  bullets: string[];
  onDone: (role:Exclude<Role,"admin">, email:string, password:string, remember:boolean)=>Promise<void>;
}) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [remember,setRemember]=useState(true);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState<string|null>(null);

  return (
    <GlassCard className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-white/80">
            {bullets.map((b)=> <li key={b}>{b}</li>)}
          </ul>
        </div>
        <span className="chip">{role.toUpperCase()}</span>
      </div>

      <form className="mt-4 space-y-3" onSubmit={async(e)=>{
        e.preventDefault(); setError(null); setLoading(true);
        try { await onDone(role, email, password, remember); }
        catch(err:any){ setError(err?.message ?? "Login error"); }
        finally{ setLoading(false); }
      }}>
        <label className="block">
          <div className="label">Email</div>
          <input className="input mt-1" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        </label>
        <label className="block">
          <div className="label">Password</div>
          <input className="input mt-1" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        </label>
        <label className="flex items-center gap-2 text-xs text-white/85">
          <input type="checkbox" className="h-4 w-4 accent-white" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
          Remember my login
        </label>
        {error ? <div className="rounded-xl border border-red-200/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">{error}</div> : null}
        <button className="glass-btn w-full" type="submit" disabled={loading}>{loading ? "..." : "Sign in"}</button>
      </form>
    </GlassCard>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { lang, onLang } = useLang();
  const configured = isSupabaseConfigured();

  async function doLogin(role:any, email:string, password:string, remember:boolean){
    await signIn(role, email, password, remember);
    router.push(role==="agency"?"/agency":role==="assistant"?"/assistant":"/guide");
  }

  return (
    <div className="min-h-screen pb-12">
      <TopBar lang={lang} onLang={onLang} />
      <Header />

      <div className="mx-auto mt-8 max-w-6xl px-4">
        {!configured ? (
          <div className="glass-soft mb-6 flex items-center gap-3 p-3">
            <span className="chip border-white/35 bg-white/15">{tr(lang,"mock_mode")}</span>
            <div className="text-sm text-white/85">{tr(lang,"mock_desc")}</div>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <RoleLoginCard role="agency" title="Agency" bullets={["Create requests for Assistants/Greeters","Create requests for Guides","Manage credits & operations"]} onDone={doLogin} />
          <RoleLoginCard role="assistant" title="Greeter / Assistant" bullets={["See requests feed","Accept or offer your price","Track confirmed operations"]} onDone={doLogin} />
          <RoleLoginCard role="guide" title="Guide" bullets={["See tour feed","Accept or offer your price","Track confirmed tours"]} onDone={doLogin} />
        </div>

        <div className="mt-10">
          <div className="glass-soft p-6 text-sm text-white/80">
            <div className="font-semibold">ArrivoHub</div>
            <div className="mt-2 space-y-1 text-xs">
              <div>Address: Demo Street 10, Istanbul</div>
              <div>Phone: +90 555 000 00 00</div>
              <div>Support: support@arrivohub.com</div>
              <div className="mt-3"><a className="underline" href="/legal">License Agreement</a> · All rights reserved.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
