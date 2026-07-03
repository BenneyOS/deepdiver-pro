import type { Card, Tier } from "../../data/schema";
import { FAMILY_LABELS, TIER_LABELS } from "../../data/schema";
import type { Wager } from "../engine/scoring";
import { roundPoints } from "../engine/scoring";

interface RevealProps {
  card: Card;
  correct: boolean;
  wager: Wager;
  onNext: () => void;
  isLastRound: boolean;
}

const TIER_COLORS: Record<Tier, string> = {
  1: "bg-blue-600",
  2: "bg-amber-600",
  3: "bg-purple-600",
  4: "bg-red-600",
};

export function Reveal({
  card,
  correct,
  wager,
  onNext,
  isLastRound,
}: RevealProps) {
  const points = roundPoints(correct, card.tier, wager);

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* Result banner */}
      <div
        className={`rounded-xl p-4 text-center ${
          correct
            ? "bg-green-900/50 text-green-300"
            : "bg-red-900/50 text-red-300"
        }`}
      >
        <div className="text-2xl font-bold">
          {correct ? "Correct!" : "Not quite."}
        </div>
        <div className="text-sm">
          {correct ? `+${points} points` : "0 points"}
        </div>
      </div>

      {/* Card anatomy */}
      <div className="rounded-2xl bg-[var(--ink-light)] p-5 shadow-xl">
        {/* Header badges */}
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
            {FAMILY_LABELS[card.family]}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold text-white ${TIER_COLORS[card.tier]}`}
          >
            T{card.tier} &middot; {TIER_LABELS[card.tier]}
          </span>
        </div>

        {/* Quote */}
        <blockquote className="mb-4 border-l-4 border-[var(--accent)] pl-4 text-base leading-relaxed text-[var(--text-primary)] italic">
          &ldquo;{card.prompt}&rdquo;
        </blockquote>

        {/* Pattern */}
        <p className="mb-3 text-sm text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">
            Pattern:
          </span>{" "}
          {card.pattern}
        </p>

        {/* Diagnostic fields */}
        <div className="space-y-3 rounded-xl bg-slate-800/50 p-4">
          <DiagField label="Root Cause" value={card.rootCause} />
          <DiagField label="Consequence" value={card.consequence} />
          <DiagField label="Diagnostic" value={card.diagnostic} />
          <DiagField label="Angle" value={card.angle} />
          <DiagField label="Objection" value={card.objection} />
          <DiagField label="Reframe" value={card.reframe} />

          {/* Persona chips */}
          <div className="mt-4 border-t border-slate-700 pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Persona Shift
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["CTO", "VPE", "CFO", "CRO"] as const).map((persona) => (
                <div
                  key={persona}
                  className="rounded-lg bg-slate-700/60 px-3 py-2"
                >
                  <span className="text-xs font-bold text-[var(--accent)]">
                    {persona}
                  </span>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                    {card.personaShift[persona]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-xl bg-[var(--accent)] py-4 text-center font-bold text-white transition-colors hover:bg-blue-700 min-h-[44px]"
      >
        {isLastRound ? "View Scorecard" : "Next Deal"}
      </button>
    </div>
  );
}

function DiagField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </p>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
        {value}
      </p>
    </div>
  );
}
