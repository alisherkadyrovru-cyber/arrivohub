"use client";
import type { Profile, Role } from "@/lib/types";
import { isSupabaseConfigured, supabaseBrowserClient } from "@/lib/supabase/client";

const KEY="arrivohub_mock_session_v1";

export async function signIn(role: Exclude<Role,"admin">, email: string, password: string, remember: boolean) {
  if (isSupabaseConfigured()) {
    const supabase = supabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { mode:"supabase" as const, role };
  }
  const profile: Profile = {
    id: role==="agency" ? "mock_agency_1" : role==="assistant" ? "mock_assistant_1" : "mock_guide_1",
    role,
    fullName: role==="agency" ? "Karavan Travel" : role==="assistant" ? "Name Surname 1" : "Name Surname 4",
    email,
    credits: role==="agency" ? 85 : undefined,
    expiresAt: role!=="agency" ? "2026-12-31" : undefined,
    phone: role==="agency" ? "+90 555 000 00 00" : role==="assistant" ? "+90 555 111 11 11" : "+90 555 222 22 22",
    address:"Istanbul (demo)",
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
  try { return (JSON.parse(raw) as {profile:Profile}).profile; } catch { return null; }
}
