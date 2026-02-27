"use client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadMockState, saveMockState } from "@/lib/mock/store";
import type { Application, ApplicantProfile, Profile, Rating, ReceiptUpload, Request, SubscriptionPayment } from "@/lib/types";

function uid(prefix:string){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`; }
function now(){ return new Date().toISOString(); }

// ─── Requests ────────────────────────────────────────────────────────────────

export async function listRequests(filter?: { kind?: "assistant"|"guide"; status?: "open"|"confirmed"|"archived" }) {
  if (isSupabaseConfigured()) { /* Supabase integration next step */ }
  const st = loadMockState();
  return st.requests
    .filter(r => filter?.kind ? r.kind===filter.kind : true)
    .filter(r => filter?.status ? r.status===filter.status : true)
    .sort((a,b) => (a.date + (a.time ?? "")) > (b.date + (b.time ?? "")) ? 1 : -1);
}

export async function createRequest(r: Omit<Request,"id"|"status"|"createdAt"|"updatedAt">, agencyProfileId?: string) {
  const st = loadMockState();
  const req = { ...r, id: uid("req"), status:"open", createdAt: now(), updatedAt: now(), agencyId: agencyProfileId } as Request;
  st.requests.unshift(req);
  if (agencyProfileId) {
    const costCredits = r.kind === "assistant" ? 5 : 10;
    const profile = st.profiles[agencyProfileId];
    if (profile && profile.credits !== undefined) {
      profile.credits = Math.max(0, profile.credits - costCredits);
      st.creditsLedger.unshift({ id: uid("led"), profileId: agencyProfileId, delta: -costCredits, note: `Request ${req.id}`, createdAt: now() });
    }
  }
  saveMockState(st);
  return req;
}

export async function listApplications(requestId: string) {
  const st = loadMockState();
  return st.applications.filter(a => a.requestId===requestId);
}

export async function addApplication(requestId: string, payload: { applicantId: string; applicantName: string; role: "assistant"|"guide"; offerTry: number|null }) {
  const st = loadMockState();
  const apps = st.applications.filter(a => a.requestId===requestId);
  if (apps.length >= 5) throw new Error("This request already has 5 applicants.");
  if (apps.find(a => a.applicantId===payload.applicantId)) throw new Error("Already applied.");
  const app: Application = { id: uid("app"), requestId, applicantId: payload.applicantId, applicantName: payload.applicantName, role: payload.role, offerTry: payload.offerTry, createdAt: now() };
  st.applications.push(app);
  saveMockState(st);
  return app;
}

export async function confirmRequest(requestId: string, applicationId: string) {
  const st = loadMockState();
  const r = st.requests.find(x => x.id===requestId);
  if (!r) throw new Error("Request not found");
  const app = st.applications.find(a => a.id===applicationId);
  if (!app) throw new Error("Application not found");
  r.status = "confirmed";
  r.updatedAt = now();
  (r as any).confirmedApplicantName = app.applicantName;
  (r as any).confirmedApplicantId = app.applicantId;
  (r as any).confirmedPriceTry = app.offerTry ?? r.priceTry;
  saveMockState(st);
  return r;
}

export async function getRequestById(requestId: string): Promise<Request | null> {
  const st = loadMockState();
  return st.requests.find(x => x.id===requestId) ?? null;
}

export async function updateConfirmedRequest(requestId: string, patch: Partial<Request>) {
  const st = loadMockState();
  const r = st.requests.find(x => x.id===requestId);
  if (!r) throw new Error("Request not found");
  Object.assign(r as any, patch);
  r.updatedAt = now();
  (r as any).pendingDetailsUpdate = true;
  saveMockState(st);
  return r;
}

export async function resolveDetailsUpdate(requestId: string, accept: boolean) {
  const st = loadMockState();
  const r = st.requests.find(x => x.id===requestId);
  if (!r) throw new Error("Request not found");
  if (accept) {
    (r as any).pendingDetailsUpdate = false;
  } else {
    r.status = "open";
    r.updatedAt = now();
    (r as any).confirmedApplicantName = undefined;
    (r as any).confirmedApplicantId = undefined;
    (r as any).confirmedPriceTry = undefined;
    (r as any).pendingDetailsUpdate = false;
    st.applications = st.applications.filter(a => a.requestId !== requestId);
  }
  saveMockState(st);
  return r;
}

export async function archiveRequest(requestId: string) {
  const st = loadMockState();
  const r = st.requests.find(x => x.id===requestId);
  if (!r) throw new Error("Request not found");
  r.status = "archived";
  r.updatedAt = now();
  (r as any).finishedAt = now();
  saveMockState(st);
  return r;
}

export async function updateRequest(requestId: string, patch: Partial<Request>) {
  const st = loadMockState();
  const r = st.requests.find(x => x.id===requestId);
  if (!r) throw new Error("Request not found");
  Object.assign(r as any, patch);
  r.updatedAt = now();
  st.applications = st.applications.filter(a => a.requestId !== requestId);
  r.status = "open";
  saveMockState(st);
  return r;
}

// ─── Transport ────────────────────────────────────────────────────────────────

export async function setTransportDetails(requestId: string, details: { driverName: string; carModel: string; plate: string; phone: string }) {
  const st = loadMockState();
  st.transport[requestId] = details;
  saveMockState(st);
  return details;
}
export async function getTransportDetails(requestId: string) {
  const st = loadMockState();
  return st.transport[requestId] ?? null;
}

// ─── Applicant profiles ───────────────────────────────────────────────────────

export async function getApplicantProfile(applicantId: string): Promise<ApplicantProfile | null> {
  const st = loadMockState();
  return st.applicantProfiles?.[applicantId] ?? null;
}

// ─── Credits ledger ───────────────────────────────────────────────────────────

export async function listCreditsLedger(profileId: string) {
  const st = loadMockState();
  return st.creditsLedger.filter(x => x.profileId===profileId).sort((a,b) => a.createdAt > b.createdAt ? -1 : 1);
}

// ─── Registration ─────────────────────────────────────────────────────────────

function generateCabinetId(role: string): string {
  const prefix = role === "agency" ? "TR-AG" : role === "assistant" ? "TR-GR" : "TR-GU";
  const num = String(Math.floor(100000 + Math.random() * 900000));
  return `${prefix}-${num}`;
}

export async function registerUser(data: Omit<Profile, "id"> & { password: string }): Promise<string> {
  const st = loadMockState();
  const existing = Object.values(st.profiles).find(p => p.email === data.email);
  if (existing) throw new Error("An account with this email already exists.");
  const { password: _pw, ...profileData } = data;
  const token = uid("reg");
  const profile: Profile = {
    ...profileData,
    id: token,
    cabinetId: generateCabinetId(data.role),
    credits: data.role === "agency" ? 0 : undefined,
  };
  st.pendingRegistrations[token] = profile;
  saveMockState(st);
  return token;
}

export async function confirmRegistration(token: string): Promise<Profile> {
  const st = loadMockState();
  const profile = st.pendingRegistrations[token];
  if (!profile) throw new Error("Invalid or expired token.");
  const newId = uid("usr");
  profile.id = newId;
  st.profiles[newId] = profile;
  delete st.pendingRegistrations[token];
  saveMockState(st);
  return profile;
}

// ─── Receipts ─────────────────────────────────────────────────────────────────

export async function uploadReceipt(data: Omit<ReceiptUpload, "id" | "createdAt">): Promise<ReceiptUpload> {
  const st = loadMockState();
  const receipt: ReceiptUpload = { ...data, id: uid("rcpt"), createdAt: now() };
  st.receiptUploads.push(receipt);
  saveMockState(st);
  return receipt;
}

export async function listReceiptUploads(profileId?: string): Promise<ReceiptUpload[]> {
  const st = loadMockState();
  const all = [...st.receiptUploads].sort((a,b) => a.createdAt > b.createdAt ? -1 : 1);
  return profileId ? all.filter(r => r.profileId === profileId) : all;
}

export async function markReceiptProcessed(receiptId: string): Promise<void> {
  const st = loadMockState();
  const r = st.receiptUploads.find(x => x.id === receiptId);
  if (r) { r.processed = true; saveMockState(st); }
}

// ─── Subscription payments ────────────────────────────────────────────────────

export async function listSubscriptionPayments(profileId: string): Promise<SubscriptionPayment[]> {
  const st = loadMockState();
  return st.subscriptionPayments
    .filter(x => x.profileId === profileId)
    .sort((a,b) => a.createdAt > b.createdAt ? -1 : 1);
}

// ─── Favorites ────────────────────────────────────────────────────────────────

export async function addFavorite(agencyId: string, applicantId: string): Promise<void> {
  const st = loadMockState();
  if (!st.favorites[agencyId]) st.favorites[agencyId] = [];
  if (!st.favorites[agencyId].includes(applicantId)) st.favorites[agencyId].push(applicantId);
  saveMockState(st);
}

export async function removeFavorite(agencyId: string, applicantId: string): Promise<void> {
  const st = loadMockState();
  if (st.favorites[agencyId]) st.favorites[agencyId] = st.favorites[agencyId].filter(id => id !== applicantId);
  saveMockState(st);
}

export async function isFavorite(agencyId: string, applicantId: string): Promise<boolean> {
  const st = loadMockState();
  return (st.favorites[agencyId] ?? []).includes(applicantId);
}

export async function isFavoriteOf(agencyId: string, applicantId: string): Promise<boolean> {
  return isFavorite(agencyId, applicantId);
}

export async function listFavorites(agencyId: string): Promise<ApplicantProfile[]> {
  const st = loadMockState();
  const ids = st.favorites[agencyId] ?? [];
  return ids.map(id => st.applicantProfiles[id]).filter(Boolean);
}

export async function searchApplicants(query: string, role?: "assistant" | "guide"): Promise<ApplicantProfile[]> {
  if (!query.trim()) return [];
  const st = loadMockState();
  const q = query.toLowerCase();
  return Object.values(st.applicantProfiles).filter(p => {
    if (role && p.role !== role) return false;
    return p.name.toLowerCase().includes(q);
  });
}

export async function publishForAll(requestId: string): Promise<void> {
  const st = loadMockState();
  const r = st.requests.find(x => x.id === requestId);
  if (r) { (r as any).onlyFavorites = false; r.updatedAt = now(); saveMockState(st); }
}

export async function getCompletedCountWithAgency(applicantId: string, agencyId: string): Promise<number> {
  const st = loadMockState();
  return st.requests.filter(r =>
    r.status === "archived" &&
    (r as any).confirmedApplicantId === applicantId &&
    (r as any).agencyId === agencyId
  ).length;
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export async function rateApplicant(
  applicantId: string, requestId: string, agencyId: string,
  stars: number, comment?: string, agencyName?: string
): Promise<void> {
  const st = loadMockState();
  const existing = st.ratings.find(r => r.requestId === requestId && r.agencyId === agencyId);
  if (existing) {
    existing.stars = stars;
    if (comment !== undefined) existing.comment = comment;
  } else {
    const rating: Rating = { id: uid("rat"), applicantId, requestId, agencyId, stars, comment, agencyName, createdAt: now() };
    st.ratings.push(rating);
  }
  // recompute average
  const allForApplicant = st.ratings.filter(r => r.applicantId === applicantId);
  const avg = allForApplicant.reduce((s, r) => s + r.stars, 0) / allForApplicant.length;
  const rounded = Math.round(avg * 10) / 10;
  if (st.applicantProfiles[applicantId]) st.applicantProfiles[applicantId].rating = rounded;
  if (st.profiles[applicantId]) (st.profiles[applicantId] as any).rating = rounded;
  saveMockState(st);
}

export async function getRatingForRequest(requestId: string, agencyId: string): Promise<Rating | null> {
  const st = loadMockState();
  return st.ratings.find(r => r.requestId === requestId && r.agencyId === agencyId) ?? null;
}

export async function getApplicantComments(applicantId: string): Promise<Rating[]> {
  const st = loadMockState();
  return st.ratings.filter(r => r.applicantId === applicantId && r.comment);
}

// ─── Sign / Board ─────────────────────────────────────────────────────────────

export async function setSignBoard(requestId: string, fileName: string): Promise<void> {
  const st = loadMockState();
  st.signBoards[requestId] = { fileName };
  saveMockState(st);
}

export async function getSignBoard(requestId: string): Promise<{ fileName: string } | null> {
  const st = loadMockState();
  return st.signBoards[requestId] ?? null;
}

// ─── Admin functions ──────────────────────────────────────────────────────────

export async function adminGetAllUsers(): Promise<Profile[]> {
  const st = loadMockState();
  return Object.values(st.profiles);
}

export async function adminTopUpCredits(agencyId: string, amount: number): Promise<void> {
  const st = loadMockState();
  const p = st.profiles[agencyId];
  if (!p) throw new Error("Agency not found");
  p.credits = (p.credits ?? 0) + amount;
  st.creditsLedger.unshift({ id: uid("led"), profileId: agencyId, delta: +amount, note: "Admin top-up", createdAt: now() });
  saveMockState(st);
}

export async function adminExtendSubscription(userId: string, days: number): Promise<void> {
  const st = loadMockState();
  const p = st.profiles[userId];
  if (!p) throw new Error("User not found");
  const base = p.expiresAt ? new Date(p.expiresAt) : new Date();
  if (base < new Date()) base.setTime(new Date().getTime());
  base.setDate(base.getDate() + days);
  p.expiresAt = base.toISOString().slice(0, 10);
  const priceTry = days <= 14 ? (p.role === "assistant" ? 500 : 1000)
                 : days <= 30 ? (p.role === "assistant" ? 900 : 1800)
                 : (p.role === "assistant" ? 2500 : 5000);
  st.subscriptionPayments.push({ id: uid("sub"), profileId: userId, days, priceTry, createdAt: now() });
  saveMockState(st);
}

export async function adminDeleteUser(userId: string): Promise<void> {
  const st = loadMockState();
  delete st.profiles[userId];
  saveMockState(st);
}

export async function adminGetAllRequests(): Promise<Request[]> {
  const st = loadMockState();
  return [...st.requests].sort((a,b) => a.createdAt > b.createdAt ? -1 : 1);
}
