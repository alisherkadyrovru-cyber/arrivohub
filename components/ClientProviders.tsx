"use client";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";
const KEY="arrivohub_lang_v1";
export function useLang() {
  const [lang, setLang] = useState<Lang>("EN");
  useEffect(() => { const saved = localStorage.getItem(KEY) as Lang | null; if (saved) setLang(saved); }, []);
  function onLang(l: Lang){ setLang(l); localStorage.setItem(KEY, l); }
  return { lang, onLang };
}
