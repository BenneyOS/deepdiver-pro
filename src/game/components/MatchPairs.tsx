import { useMemo, useState } from "react";
import type { Card } from "../../data/schema";
import { useGameStore } from "../store/useGameStore";
import { Ada } from "./Ada";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Format 3 — Match Pairs. Connect each symptom (prompt) to its root cause.
// Tap a symptom, then tap a root cause to link them; validate all at once.
// Writes each matched card to the one progress ledger.
export function MatchPairs({ onHome }: { onHome: () => void }) {
  const queue = useGameStore((s) => s.queue);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const finishSpeed = useGameStore((s) => s.finishSpeed);

  const symptoms = queue;
  // Root-cause bank: same cards, shuffled, shown numbered.
  const causes = useMemo(() => shuffle(symptoms), [symptoms]);

  const [selected, setSelected] = useState<string | null>(null);
  // symptom card id -> assigned cause card id
  const [links, setLinks] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const assignedCauseIds = new Set(Object.values(links));
  const allAssigned = Object.keys(links).length === symptoms.length;

  function tapSymptom(id: string) {
    if (checked) return;
    setSelected((cur) => (cur === id ? null : id));
  }

  function tapCause(causeId: string) {
    if (checked) return;
    if (!selected) return;
    setLinks((prev) => {
      const next = { ...prev };
      // remove this cause from any other symptom
      for (const k of Object.keys(next)) if (next[k] === causeId) delete next[k];
      next[selected] = causeId;
      return next;
    });
    setSelected(null);
  }

  function check() {
    let hits = 0;
    for (const s of symptoms) {
      const correct = links[s.id] === s.id;
      if (correct) hits++;
      recordAnswer(s, correct);
    }
    finishSpeed({
      mode: "match-pairs",
      score: hits * 100,
      hits,
      total: symptoms.length,
      maxStreak: hits,
    });
    setChecked(true);
  }

  const hits = checked ? symptoms.filter((s) => links[s.id] === s.id).length : 0;
  const causeNumber = (causeId: string) => causes.findIndex((c) => c.id === causeId) + 1;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-3 flex items-center gap-3">
        <Ada expression={checked ? (hits === symptoms.length ? "impressed" : "neutral") : "thinking"} size={40} />
        <div>
          <h2 className="text-lg font-extrabold text-[var(--ink)]">Match the pairs</h2>
          <p className="text-xs text-[var(--text-dim)]">
            {checked ? `${hits} of ${symptoms.length} matched` : "Tap a symptom, then its root cause"}
          </p>
        </div>
      </div>

      {/* Symptoms */}
      <div className="space-y-2">
        {symptoms.map((s: Card) => {
          const assigned = links[s.id];
          const isSel = selected === s.id;
          const correct = checked && assigned === s.id;
          const wrong = checked && assigned && assigned !== s.id;
          let ring = "border-[var(--border)]";
          if (correct) ring = "border-[var(--success)] bg-[var(--success)]/10";
          else if (wrong) ring = "border-[var(--danger)] bg-[var(--danger)]/10";
          else if (isSel) ring = "border-[var(--ink)] ring-2 ring-[var(--ink)]";
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => tapSymptom(s.id)}
              disabled={checked}
              className={`flex w-full items-start gap-2 rounded-2xl border bg-[var(--card)] px-4 py-3 text-left text-sm leading-snug text-[var(--ink)] transition-all min-h-[44px] ${ring} ${checked ? "" : "active:scale-[0.98]"}`}
            >
              <span className="flex-1">&ldquo;{s.prompt}&rdquo;</span>
              {assigned && (
                <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${correct ? "bg-[var(--success)] text-white" : wrong ? "bg-[var(--danger)] text-white" : "bg-[var(--accent-bg)] text-[var(--accent-ink)]"}`}>
                  {causeNumber(assigned)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Root-cause bank */}
      <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
        Root causes
      </p>
      <div className="space-y-2">
        {causes.map((c: Card, i) => {
          const used = assignedCauseIds.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => tapCause(c.id)}
              disabled={checked || !selected}
              className={`flex w-full items-start gap-2 rounded-2xl border px-4 py-3 text-left text-sm leading-snug transition-all min-h-[44px] ${
                used ? "border-[var(--accent)] bg-[var(--accent-bg)]/40" : "border-[var(--border)] bg-[var(--card-2)]"
              } ${!selected || checked ? "opacity-80" : "hover:border-[var(--text-dim)] active:scale-[0.98]"} text-[var(--ink)]`}
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--card)] text-xs font-bold text-[var(--accent-ink)]">
                {i + 1}
              </span>
              <span className="flex-1">{c.rootCause}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        {!checked ? (
          <button
            type="button"
            disabled={!allAssigned}
            onClick={check}
            className={`w-full rounded-2xl py-4 text-center font-bold text-white transition-all min-h-[44px] ${
              allAssigned ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98]" : "cursor-not-allowed bg-[var(--border)]"
            }`}
          >
            Check matches
          </button>
        ) : (
          <button
            type="button"
            onClick={onHome}
            className="w-full rounded-2xl bg-[var(--accent)] py-4 text-center font-bold text-white active:scale-[0.98] min-h-[44px]"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
