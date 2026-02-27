"use client";
import Link from "next/link";
import { LANGS, type Lang } from "@/lib/i18n";
export function TopBar({ lang, onLang }:{ lang:Lang; onLang:(l:Lang)=>void }) {
  return (
    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
      <Link href="/support" className="chip hover:border-white/35 text-white/70 hover:text-white/90">Contact support</Link>
      <div className="glass-soft flex items-center gap-2 px-3 py-1.5">
        {LANGS.map((l) => (
          <button key={l} className={"chip " + (l===lang ? "border-white/45 bg-white/15" : "hover:border-white/35")} onClick={() => onLang(l)} type="button">
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
