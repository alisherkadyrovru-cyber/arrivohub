"use client";
import { useEffect, useState } from "react";
import { addFavorite, removeFavorite, isFavorite, getApplicantComments } from "@/lib/repo";
import type { ApplicantProfile, Rating } from "@/lib/types";

export function ApplicantModal({
  profile, onClose, showContact, agencyId,
}: {
  profile: ApplicantProfile;
  onClose: () => void;
  showContact: boolean;
  agencyId: string;
}) {
  const [fav, setFav] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [comments, setComments] = useState<Rating[]>([]);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (agencyId) isFavorite(agencyId, profile.id).then(setFav);
    getApplicantComments(profile.id).then(setComments);
  }, [agencyId, profile.id]);

  async function toggleFav() {
    setToggling(true);
    if (fav) { await removeFavorite(agencyId, profile.id); setFav(false); }
    else { await addFavorite(agencyId, profile.id); setFav(true); }
    setToggling(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="glass max-w-sm w-full mx-4 p-5 space-y-3" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-base font-semibold">{profile.name}</div>
            <div className="text-xs text-white/70 mt-0.5">{profile.gender} · {profile.age} years old</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-xl leading-none transition-opacity disabled:opacity-50"
              onClick={toggleFav}
              disabled={toggling}
              title={fav ? "Remove from favorites" : "Add to favorites"}
            >
              {fav ? "♥" : "♡"}
            </button>
            <button className="glass-btn px-2 py-1 text-xs" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="space-y-1.5 text-sm">
          <div><span className="muted">Languages: </span>{profile.languages.map(l => `${l.lang} (${l.level})`).join(", ")}</div>
          <div><span className="muted">Rating: </span>{"★".repeat(Math.round(profile.rating))}{"☆".repeat(5 - Math.round(profile.rating))} {profile.rating}/5</div>
          <div><span className="muted">Completed: </span>{profile.completedCount} requests</div>
          {profile.tursabCard && <div><span className="muted">Tursab ID: </span>{profile.tursabCard}</div>}
          {profile.kokartId && <div><span className="muted">Kokart ID: </span>{profile.kokartId}</div>}
          {showContact && profile.phone && <div><span className="muted">Phone: </span>{profile.phone}</div>}
          {showContact && profile.email && <div><span className="muted">Email: </span>{profile.email}</div>}
        </div>

        {comments.length > 0 && (
          <div>
            <button
              className="glass-btn text-xs"
              type="button"
              onClick={() => setShowComments(v => !v)}
            >
              {showComments ? "Hide comments" : `View comments (${comments.length})`}
            </button>
            {showComments && (
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {comments.map(c => (
                  <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span>{"★".repeat(c.stars)}{"☆".repeat(5 - c.stars)}</span>
                      {c.agencyName && <span className="text-white/50">{c.agencyName}</span>}
                    </div>
                    <div className="text-white/80">{c.comment}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
