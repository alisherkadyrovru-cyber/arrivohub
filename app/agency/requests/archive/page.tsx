"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RequestCard } from "@/components/RequestCard";
import { ApplicantModal } from "@/components/ApplicantModal";
import { agencyNav } from "@/lib/nav";
import { listRequests, getTransportDetails, getApplicantProfile, getRatingForRequest, rateApplicant } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { ApplicantProfile, Request } from "@/lib/types";

function fmtDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function StarRating({ requestId, applicantId, agencyId, agencyName, onRated }: {
  requestId: string; applicantId: string; agencyId: string; agencyName: string; onRated: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [saved, setSaved] = useState(false);   // true = stars locked
  const [saving, setSaving] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [submittedComment, setSubmittedComment] = useState("");

  useEffect(() => {
    getRatingForRequest(requestId, agencyId).then(r => {
      if (r) {
        setStars(r.stars);
        setSaved(true);
        if (r.comment) { setCommentSubmitted(true); setSubmittedComment(r.comment); }
      }
    });
  }, [requestId, agencyId]);

  async function saveRating(s: number) {
    setSaving(true);
    await rateApplicant(applicantId, requestId, agencyId, s, undefined, agencyName);
    setStars(s); setSaved(true); setSaving(false); onRated();
  }

  async function saveComment() {
    if (!commentText.trim()) return;
    setSaving(true);
    await rateApplicant(applicantId, requestId, agencyId, stars, commentText.trim(), agencyName);
    setSubmittedComment(commentText.trim());
    setCommentSubmitted(true);
    setShowCommentInput(false);
    setSaving(false);
  }

  return (
    <div className="space-y-2 border-t border-white/10 pt-3 mt-1">
      <div className="flex items-center gap-1">
        <span className="muted text-sm mr-1">Rate:</span>
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            className="text-lg leading-none transition-colors"
            style={{ color: n <= (saved ? stars : (hover || stars)) ? "#facc15" : "rgba(255,255,255,0.3)" }}
            onMouseEnter={() => { if (!saved) setHover(n); }}
            onMouseLeave={() => { if (!saved) setHover(0); }}
            onClick={() => { if (!saved && !saving) saveRating(n); }}
            disabled={saved || saving}
          >★</button>
        ))}
        {saved && <span className="text-xs text-emerald-300 ml-1">Rated</span>}
      </div>

      {saved && !commentSubmitted && (
        <div className="space-y-1">
          {!showCommentInput ? (
            <button
              type="button"
              className="glass-btn text-xs"
              onClick={() => setShowCommentInput(true)}
            >
              Write a comment
            </button>
          ) : (
            <div className="flex gap-2 items-start">
              <textarea
                className="input flex-1 min-h-[72px] text-sm"
                placeholder="Optional comment about this person... (max 1000 chars)"
                value={commentText}
                maxLength={1000}
                onChange={e => setCommentText(e.target.value)}
              />
              <button
                className="glass-btn text-xs self-end"
                type="button"
                disabled={saving || !commentText.trim()}
                onClick={saveComment}
              >Save</button>
            </div>
          )}
        </div>
      )}

      {saved && commentSubmitted && (
        <div className="text-sm text-white/75 italic border-l-2 border-white/20 pl-3">
          {submittedComment}
        </div>
      )}
    </div>
  );
}

export default function Archive() {
  const [agencyId, setAgencyId] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [transport, setTransport] = useState<Record<string, any>>({});
  const [modalProfile, setModalProfile] = useState<ApplicantProfile | null>(null);

  async function load() {
    const rs = await listRequests({ status: "archived" });
    setRequests(rs);
    const t: Record<string, any> = {};
    for (const r of rs) t[r.id] = await getTransportDetails(r.id);
    setTransport(t);
  }

  useEffect(() => {
    getCurrentProfile().then(p => { if (p) { setAgencyId(p.id); setAgencyName(p.fullName); } });
    load();
  }, []);

  async function handleNameClick(applicantId?: string) {
    if (!applicantId) return;
    const profile = await getApplicantProfile(applicantId);
    if (profile) setModalProfile(profile);
  }

  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={(p) => p.fullName} rightSlot={(p) => <span className="chip">Credits: {p.credits ?? 0}</span>}>
      {modalProfile && agencyId && (
        <ApplicantModal profile={modalProfile} onClose={() => setModalProfile(null)} showContact={true} agencyId={agencyId} />
      )}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Archived requests</div>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-sm text-white/75">Archive is empty.</div>
          ) : requests.map(r => (
            <RequestCard key={r.id} request={r}>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="muted">Completed by: </span>
                  <button className="font-semibold underline underline-offset-2 hover:opacity-75" onClick={() => handleNameClick((r as any).confirmedApplicantId)}>
                    {(r as any).confirmedApplicantName ?? "—"}
                  </button>
                </div>
                <div><span className="muted">Agreed price: </span><span className="font-semibold">{(r as any).confirmedPriceTry?.toLocaleString("tr-TR") ?? "—"} TRY</span></div>
                {transport[r.id] ? (
                  <div><span className="muted">Driver & transport: </span><span className="text-white/85">{transport[r.id].driverName} · {transport[r.id].carModel} · {transport[r.id].plate} · {transport[r.id].phone}</span></div>
                ) : null}
                <div><span className="muted">Finished at: </span><span className="text-white/85">{fmtDateTime((r as any).finishedAt)}</span></div>
              </div>
              {(r as any).confirmedApplicantId && agencyId && (
                <StarRating
                  requestId={r.id}
                  applicantId={(r as any).confirmedApplicantId}
                  agencyId={agencyId}
                  agencyName={agencyName}
                  onRated={load}
                />
              )}
            </RequestCard>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
