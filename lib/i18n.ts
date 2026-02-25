export type Lang = "EN" | "TR" | "RU";
export const LANGS: Lang[] = ["EN","TR","RU"];
const dict = {
  mock_mode: { EN:"MOCK MODE", TR:"MOCK MOD", RU:"MOCK РЕЖИМ" },
  mock_desc: {
    EN:"Supabase is not configured yet. UI works with demo data.",
    TR:"Supabase henüz ayarlanmadı. Arayüz demo veriyle çalışıyor.",
    RU:"Supabase пока не подключен. Интерфейс работает на демо-данных.",
  },
} as const;
export function tr(lang: Lang, key: keyof typeof dict) { return dict[key][lang]; }
