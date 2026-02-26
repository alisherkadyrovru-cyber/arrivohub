"use client";
import type { Profile, Role } from "@/lib/types";
import { isSupabaseConfigured, supabaseBrowserClient } from "@/lib/supabase/client";
import { loadMockState } from "@/lib/mock/store";

const KEY = "arrivohub_mock_session_v1";
const ADMIN_KEY = "arrivohub_admin_session_v1";
const ADMIN_PASSWORD = "Admin1234";

export async function signIn(role: Exclude<Role,"admin">, email: string, password: string, remember: boolean) {
  if (isSupabaseConfigured()) {
    const supabase = supabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { mode:"supabase" as const, role };
  }
  // look up registered user first; fall back to seed demo profile
  const st = loadMockState();
  const registered = Object.values(st.profiles).find(p => p.email === email && p.role === role);
  const seedId = role === "agency" ? "mock_agency_1" : role === "assistant" ? "mock_assistant_1" : "mock_guide_1";
  const profile: Profile = registered ?? st.profiles[seedId] ?? {
    id: seedId, role, fullName: role === "agency" ? "Travel Agency Name 1" : "Name Surname 1",
    email, credits: role === "agency" ? 0 : undefined,
    expiresAt: role !== "agency" ? "2026-12-31" : undefined,
  };
  const payload = JSON.stringify({ profile });
  (remember ? localStorage : sessionStorage).setItem(KEY, payload);
  return { mode:"mock" as const, role };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = supabaseBrowserClient();
    await supabase.auth.signOut();
    return;
  }
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}

export async function getCurrentProfile(): Promise<Profile|null> {
  if (isSupabaseConfigured()) {
    const supabase = supabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    const meta: any = data.session.user.user_metadata ?? {};
    const role = (meta.role ?? "agency") as Role;
    const fullName = meta.full_name ?? (data.session.user.email ?? "User");
    return { id:data.session.user.id, role, fullName, email: data.session.user.email ?? "" };
  }
  const raw = localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const cached = (JSON.parse(raw) as {profile:Profile}).profile;
    // refresh from store to pick up admin changes (credits, expiresAt, etc.)
    const st = loadMockState();
    const fresh = st.profiles[cached.id];
    if (fresh) {
      const updated = JSON.stringify({ profile: fresh });
      if (localStorage.getItem(KEY)) localStorage.setItem(KEY, updated);
      else sessionStorage.setItem(KEY, updated);
      return fresh;
    }
    return cached;
  } catch { return null; }
}

// ─── Admin session ────────────────────────────────────────────────────────────

export function signInAdmin(password: string): boolean {
  if (password !== ADMIN_PASSWORD) return false;
  sessionStorage.setItem(ADMIN_KEY, "1");
  return true;
}

export function signOutAdmin(): void {
  sessionStorage.removeItem(ADMIN_KEY);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_KEY) === "1";
}
