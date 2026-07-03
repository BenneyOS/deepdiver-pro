import type { Card, Tier } from "../../data/schema";
import { FAMILY_LABELS, TIER_LABELS } from "../../data/schema";

interface ScenarioCardProps {
  card: Card;
}

const TIER_COLORS: Record<Tier, string> = {
  1: "bg-blue-600",
  2: "bg-amber-600",
  3: "bg-purple-600",
  4: "bg-red-600",
};

export function ScenarioCard({ card }: ScenarioCardProps) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl bg-[var(--ink-light)] p-6 shadow-xl">
      {/* Header: Family + Tier badges */}
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-300">
          {FAMILY_LABELS[card.family]}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold text-white ${TIER_COLORS[card.tier]}`}
        >
          T{card.tier} &middot; {TIER_LABELS[card.tier]}
        </span>
      </div>

      {/* Buyer quote */}
      <blockquote className="mb-6 border-l-4 border-[var(--accent)] pl-4 text-lg leading-relaxed text-[var(--text-primary)] italic">
        &ldquo;{card.prompt}&rdquo;
      </blockquote>

      {/* Pattern label */}
      <p className="mb-4 text-sm text-[var(--text-secondary)]">
        <span className="font-semibold text-[var(--text-primary)]">Pattern:</span>{" "}
        {card.pattern}
      </p>

      {/* Diagnostic anatomy (static reveal for M0) */}
      <div className="space-y-3 rounded-xl bg-slate-800/50 p-4">
        <DiagnosticField label="Root Cause" value={card.rootCause} />
        <DiagnosticField label="Consequence" value={card.consequence} />
        <DiagnosticField label="Diagnostic" value={card.diagnostic} />
        <DiagnosticField label="Angle" value={card.angle} />
        <DiagnosticField label="Objection" value={card.objection} />
        <DiagnosticField label="Reframe" value={card.reframe} />

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
  );
}

function DiagnosticField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
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
