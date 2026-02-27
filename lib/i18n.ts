export type Lang = "EN" | "TR";
export const LANGS: Lang[] = ["EN","TR"];
const dict = {
  mock_mode: { EN:"MOCK MODE", TR:"MOCK MOD" },
  mock_desc: {
    EN:"Supabase is not configured yet. UI works with demo data.",
    TR:"Supabase henüz ayarlanmadı. Arayüz demo veriyle çalışıyor.",
  },
} as const;
export function tr(lang: Lang, key: keyof typeof dict) { return dict[key][lang]; }
