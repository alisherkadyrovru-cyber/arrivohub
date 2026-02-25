"use client";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadMockState, saveMockState } from "@/lib/mock/store";
import type { Application, ApplicantProfile, Request } from "@/lib/types";

function uid(prefix:string){ return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`; }
function now(){ return new Date().toISOString(); }

export async function listRequests(filter?: { kind?: "assistant"|"guide"; status?: "open"|"confirmed"|"archived" }) {
  if (isSupabaseConfigured()) {
    // Supabase integration comes next step; keep UI runnable now.
  }
  const st = loadMockState();
  return st.requests
    .filter(r => filter?.kind ? r.kind===filter.kind : true)
    .filter(r => filter?.status ? r.status===filter.status : true)
    .sort((a,b) => (a.date + (a.time ?? "")) > (b.date + (b.time ?? "")) ? 1 : -1);
}

export async function createRequest(r: Omit<Request,"id"|"status"|"createdAt"|"updatedAt">) {
  const st = loadMockState();
  const req = { ...r, id: uid("req"), status:"open", createdAt: now(), updatedAt: now() } as Request;
  st.requests.unshift(req);
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
  // prevent duplicate application from same person
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

export async function getApplicantProfile(applicantId: string): Promise<ApplicantProfile | null> {
  const st = loadMockState();
  return st.applicantProfiles?.[applicantId] ?? null;
}

export async function archiveRequest(requestId: string) {
  const st = loadMockState();
  const r = st.requests.find(x => x.id===requestId);
  if (!r) throw new Error("Request not found");
  r.status="archived"; r.updatedAt=now();
  saveMockState(st);
  return r;
}

export async function updateRequest(requestId: string, patch: Partial<Request>) {
  const st = loadMockState();
  const r = st.requests.find(x => x.id===requestId);
  if (!r) throw new Error("Request not found");
  Object.assign(r as any, patch);
  r.updatedAt=now();
  st.applications = st.applications.filter(a => a.requestId !== requestId);
  r.status="open";
  saveMockState(st);
  return r;
}

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
export async function listCreditsLedger(profileId: string) {
  const st = loadMockState();
  return st.creditsLedger.filter(x => x.profileId===profileId).sort((a,b) => a.createdAt > b.createdAt ? -1 : 1);
}
