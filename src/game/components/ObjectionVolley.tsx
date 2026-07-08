import { useMemo, useState } from "react";
import type { AnswerOption } from "../engine/session";
import { buildReframeOptions } from "../engine/formats";
import { FAMILY_LABELS } from "../../data/schema";
import { useGameStore } from "../store/useGameStore";
import { Ada } from "./Ada";

// Format 7 — Live Objection Volley. Three objections from one family, back to
// back. Answer with the strongest reframe; a single miss ends the volley. Big
// streak payoff. Writes each answer to the one progress ledger.
export function ObjectionVolley({ onHome }: { onHome: () => void }) {
  const queue = useGameStore((s) => s.queue);
  const allCards = useGameStore((s) => s.allCards);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const finishSpeed = useGameStore((s) => s.finishSpeed);

  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [ended, setEnded] = useState<null | "miss" | "complete">(null);
  const recorded = useState(() => new Set<string>())[0];

  const card = queue[idx];
  const options: AnswerOption[] = useMemo(
    () => (card ? buildReframeOptions(card, allCards) : []),
    [card, allCards],
  );

  function finish(kind: "miss" | "complete", finalScore: number, finalHits: number) {
    setEnded(kind);
    finishSpeed({ mode: "objection-volley", score: finalScore, hits: finalHits, total: queue.length, maxStreak: finalHits });
  }

  function pick(i: number) {
    if (picked !== null || ended || !card) return;
    setPicked(i);
    const correct = options[i].correct;
    if (!recorded.has(card.id)) {
      recorded.add(card.id);
      recordAnswer(card, correct);
    }
    const newHits = correct ? hits + 1 : hits;
    const newScore = correct ? score + 100 * newHits : score; // rising payoff
    setTimeout(() => {
      if (!correct) {
        finish("miss", newScore, newHits);
        return;
      }
      setHits(newHits);
      setScore(newScore);
      if (idx + 1 >= queue.length) {
        finish("complete", newScore + 200, newHits); // volley clear bonus
      } else {
        setIdx(idx + 1);
        setPicked(null);
      }
    }, 650);
  }

  if (ended) {
    return (
      <div className="mx-auto w-full max-w-md space-y-5 text-center animate-card-deal">
        <Ada expression={ended === "complete" ? "impressed" : "unbothered"} size={56} />
        <h2 className="text-2xl font-extrabold text-[var(--ink)]">
          {ended === "complete" ? "Volley cleared!" : "Volley broken"}
        </h2>
        <p className="text-sm text-[var(--text-dim)]">
          {hits} of {queue.length} objections handled
        </p>
        <div className="mx-auto w-fit rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-3">
          <div className="font-telemetry text-2xl font-bold text-[var(--accent-ink)]">{score}</div>
          <div className="text-xs text-[var(--text-dim)]">coins</div>
        </div>
        <button
          type="button"
          onClick={onHome}
          className="w-full rounded-2xl bg-[var(--accent)] py-4 font-bold text-white active:scale-[0.98] min-h-[44px]"
        >
          Done
        </button>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Volley progress */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
          {FAMILY_LABELS[card.family]}
        </span>
        <div className="flex gap-1.5">
          {queue.map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${
                i < hits ? "bg-[var(--success)]" : i === idx ? "bg-[var(--accent)]" : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm animate-card-deal" key={idx}>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--danger)]">
          Objection {idx + 1} of {queue.length}
        </p>
        <blockquote className="mt-2 border-l-2 border-[var(--danger)] pl-3 text-base leading-relaxed text-[var(--ink)] font-buyer-quote">
          &ldquo;{card.objection}&rdquo;
        </blockquote>
      </div>

      <p className="mt-4 mb-2 text-center text-sm font-medium text-[var(--text-dim)]">
        Fire back with the strongest reframe
      </p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const isPick = picked === i;
          const reveal = picked !== null;
          let cls = "border-[var(--border)] bg-[var(--card)] text-[var(--ink)] hover:border-[var(--text-dim)]";
          if (reveal && opt.correct) cls = "border-[var(--success)] bg-[var(--success)]/10 text-[var(--ink)]";
          else if (reveal && isPick) cls = "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--ink)]";
          else if (reveal) cls = "border-[var(--border)] bg-[var(--card)] text-[var(--text-faint)] opacity-60";
          return (
            <button
              key={i}
              type="button"
              disabled={reveal}
              onClick={() => pick(i)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm leading-relaxed transition-all min-h-[44px] ${cls} ${reveal ? "" : "active:scale-[0.97]"}`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
