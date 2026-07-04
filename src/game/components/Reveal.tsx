import type { Card, Tier } from "../../data/schema";
import { FAMILY_LABELS, TIER_LABELS } from "../../data/schema";
import type { Wager } from "../engine/scoring";
import { roundPoints } from "../engine/scoring";
import { Ada } from "./Ada";
import { getAdaMicrocopy } from "./adaMicrocopy";
import { ParticleBurst } from "./ParticleBurst";

interface RevealProps {
  card: Card;
  correct: boolean;
  wager: Wager;
  streak: number;
  onNext: () => void;
  isLastRound: boolean;
}

const TIER_COLORS: Record<Tier, string> = {
  1: "bg-blue-600/80",
  2: "bg-amber-600/80",
  3: "bg-purple-600/80",
  4: "bg-[var(--danger)]/80",
};

export function Reveal({
  card,
  correct,
  wager,
  streak,
  onNext,
  isLastRound,
}: RevealProps) {
  const points = roundPoints(correct, card.tier, wager);
  const adaMicrocopy = getAdaMicrocopy(correct, wager, streak);
  const adaExpression = correct
    ? (streak >= 3 ? "impressed" : "pleased")
    : "unbothered";

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {/* Result banner with Ada */}
      <div
        className={`relative rounded-2xl border p-4 ${
          correct
            ? "bg-[var(--success)]/10 border-[var(--success)]/30"
            : "bg-[var(--danger)]/10 border-[var(--danger)]/30"
        } animate-card-deal`}
      >
        <div className="flex items-center gap-3">
          <Ada expression={adaExpression as "neutral" | "pleased" | "thinking" | "impressed" | "unbothered"} size={40} />
          <div className="flex-1">
            <div className={`text-lg font-bold ${correct ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {correct ? "Correct" : "Not quite"}
            </div>
            <p className="text-sm text-[var(--text-dim)] italic">
              &ldquo;{adaMicrocopy}&rdquo;
            </p>
          </div>
          {correct && (
            <div className="relative">
              <span className="font-telemetry text-lg font-bold text-[var(--accent-ink)] animate-points-glow">
                +{points}
              </span>
              <ParticleBurst active={correct} color="var(--accent)" count={6} />
            </div>
          )}
        </div>
      </div>

      {/* Card anatomy */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm animate-section-enter" style={{ animationDelay: "100ms" }}>
        {/* Header badges */}
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-full border border-[var(--border)] bg-[var(--card-2)] px-3 py-1 text-xs font-medium text-[var(--text-dim)]">
            {FAMILY_LABELS[card.family]}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold text-white ${TIER_COLORS[card.tier]}`}
          >
            T{card.tier} &middot; {TIER_LABELS[card.tier]}
          </span>
        </div>

        {/* Quote — serif italic */}
        <blockquote className="mb-4 border-l-2 border-[var(--accent)] pl-4 text-base leading-relaxed text-[var(--ink)] font-buyer-quote">
          &ldquo;{card.prompt}&rdquo;
        </blockquote>

        {/* Pattern */}
        <p className="mb-3 text-sm text-[var(--text-dim)]">
          <span className="font-semibold text-[var(--ink)]">
            Pattern:
          </span>{" "}
          {card.pattern}
        </p>

        {/* Diagnostic fields */}
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-4">
          <DiagField label="Root Cause" value={card.rootCause} />
          <DiagField label="Consequence" value={card.consequence} />
          <DiagField label="Diagnostic" value={card.diagnostic} />
          <DiagField label="Angle" value={card.angle} />
          <DiagField label="Objection" value={card.objection} />
          <DiagField label="Reframe" value={card.reframe} />

          {/* Persona chips */}
          <div className="mt-4 border-t border-[var(--border)] pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
              Persona Shift
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["CTO", "VPE", "CFO", "CRO"] as const).map((persona) => (
                <div
                  key={persona}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2"
                >
                  <span className="text-xs font-bold text-[var(--accent-ink)]">
                    {persona}
                  </span>
                  <p className="mt-0.5 text-xs text-[var(--text-dim)]">
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
        className="w-full rounded-2xl bg-[var(--ink)] py-4 text-center font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] min-h-[44px] animate-section-enter"
        style={{ animationDelay: "200ms", transitionTimingFunction: "var(--ease-standard)" }}
      >
        {isLastRound ? "View Scorecard" : "Next Deal"}
      </button>
    </div>
  );
}

function DiagField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
        {label}
      </p>
      <p className="text-sm leading-relaxed text-[var(--text-dim)]">
        {value}
      </p>
    </div>
  );
}
