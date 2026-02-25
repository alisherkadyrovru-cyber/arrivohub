"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import { Sidebar, type NavItem } from "@/components/Sidebar";
import { useLang } from "@/components/ClientProviders";
import { getCurrentProfile, signOut } from "@/lib/session";
import type { Profile, Role } from "@/lib/types";

export function AppShell({
  role, navItems, centerTitle, rightSlot, children
}:{
  role: Exclude<Role,"admin">;
  navItems: NavItem[];
  centerTitle: (p:Profile)=>string;
  rightSlot?: (p:Profile)=>React.ReactNode;
  children: React.ReactNode;
}) {
  const { lang, onLang } = useLang();
  const router = useRouter();
  const [profile,setProfile]=useState<Profile|null>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{ let alive=true;
    (async()=>{
      const p = await getCurrentProfile();
      if (!alive) return;
      if (!p){ router.replace("/"); return; }
      if (p.role !== role){ router.replace(p.role==="agency"?"/agency":p.role==="assistant"?"/assistant":"/guide"); return; }
      setProfile(p); setLoading(false);
    })();
    return ()=>{alive=false;}
  },[router,role]);

  const headerRight = useMemo(()=> {
    if (!profile) return null;
    return (
      <div className="flex items-center gap-2">
        {rightSlot ? rightSlot(profile) : null}
      </div>
    );
  },[profile,rightSlot]);

  const fullNavItems = useMemo(() => {
    if (!profile) return navItems;
    return [
      ...navItems,
      { label: "Logout", onClick: async () => { await signOut(); router.push("/"); } },
    ];
  }, [navItems, profile, router]);

  if (loading) return <div className="min-h-screen"><div className="mx-auto max-w-6xl px-4 py-10 text-white/80">Loading...</div></div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen pb-12">
      <TopBar lang={lang} onLang={onLang} />
      <Header showContacts={false} titleCenter={centerTitle(profile)} rightSlot={headerRight} />
      <div className="mx-auto mt-6 max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <Sidebar items={fullNavItems as any} />
          <div className="glass p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
