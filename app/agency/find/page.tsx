"use client";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ApplicantModal } from "@/components/ApplicantModal";
import { agencyNav } from "@/lib/nav";
import { searchApplicants } from "@/lib/repo";
import { getCurrentProfile } from "@/lib/session";
import type { ApplicantProfile } from "@/lib/types";

export default function FindPage() {
  const [agencyId, setAgencyId] = useState("");
  const [role, setRole] = useState<"assistant" | "guide">("assistant");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApplicantProfile[]>([]);
  const [modal, setModal] = useState<ApplicantProfile | null>(null);

  useEffect(() => {
    getCurrentProfile().then(p => { if (p) setAgencyId(p.id); });
  }, []);

  useEffect(() => {
    searchApplicants(query, role).then(setResults);
  }, [query, role]);

  return (
    <AppShell role="agency" navItems={agencyNav} centerTitle={p => p.fullName} rightSlot={p => <span className="chip">Credits: {p.credits ?? 0}</span>}>
      {modal && agencyId && (
        <ApplicantModal profile={modal} onClose={() => setModal(null)} showContact={false} agencyId={agencyId} />
      )}
      <div className="space-y-4">
        <div className="text-lg font-semibold">Find Assistant / Guide</div>

        <div className="flex gap-2">
          {(["assistant", "guide"] as const).map(r => (
            <button
              key={r}
              className={`glass-btn px-4 ${role === r ? "opacity-100" : "opacity-50"}`}
              onClick={() => { setRole(r); setQuery(""); setResults([]); }}
            >
              {r === "assistant" ? "Assistants" : "Guides"}
            </button>
          ))}
        </div>

        <input
          className="input"
          placeholder="Search by name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />

        {query.trim() === "" ? (
          <div className="text-sm text-white/60">Type a name to search.</div>
        ) : results.length === 0 ? (
          <div className="text-sm text-white/60">No results found.</div>
        ) : (
          <div className="space-y-2">
            {results.map(p => (
              <button
                key={p.id}
                className="glass-soft w-full text-left px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors rounded-xl"
                onClick={() => setModal(p)}
              >
                <span className="font-medium">{p.name}</span>
                <span className="chip text-xs">{p.role === "assistant" ? "Assistant" : "Guide"}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
