"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ApplicantModal } from "@/components/ApplicantModal";
import { agencyNav } from "@/lib/nav";
import { listFavorites, getCompletedCountWithAgency } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { ApplicantProfile } from "@/lib/types";

export default function FavoritesPage() {
  const [agencyId, setAgencyId] = useState("");
  const [favorites, setFavorites] = useState<ApplicantProfile[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [role, setRole] = useState<"assistant" | "guide">("assistant");
  const [modal, setModal] = useState<ApplicantProfile | null>(null);

  async function load(id: string) {
    const favs = await listFavorites(id);
    setFavorites(favs);
    const c: Record<string, number> = {};
    for (const f of favs) c[f.id] = await getCompletedCountWithAgency(f.id, id);
    setCounts(c);
  }

  useEffect(() => {
    getCurrentProfile().then(p => {
      if (p) { setAgencyId(p.id); load(p.id); }
    });
  }, []);

  const filtered = favorites.filter(f => f.role === role);

  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={p => p.fullName} rightSlot={p => <span className="chip">Credits: {p.credits ?? 0}</span>}>
      {modal && agencyId && (
        <ApplicantModal
          profile={modal}
          onClose={() => { setModal(null); load(agencyId); }}
          showContact={false}
          agencyId={agencyId}
        />
      )}
      <div className="space-y-4">
        <div className="text-lg font-semibold">My Favorites</div>

        <div className="flex gap-2">
          {(["assistant", "guide"] as const).map(r => (
            <button
              key={r}
              className={`glass-btn px-4 ${role === r ? "opacity-100" : "opacity-50"}`}
              onClick={() => setRole(r)}
            >
              {r === "assistant" ? "Assistants" : "Guides"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-sm text-white/60">
            No favorites yet. Click the ♡ button on a profile card to add someone.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(f => (
              <button
                key={f.id}
                className="glass-soft w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors rounded-xl"
                onClick={() => setModal(f)}
              >
                <span className="font-medium">{f.name}</span>
                <div className="flex items-center gap-3">
                  {counts[f.id] !== undefined && counts[f.id] > 0 && (
                    <span className="text-xs text-white/60">{counts[f.id]} completed</span>
                  )}
                  <span className="text-base">♥</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
