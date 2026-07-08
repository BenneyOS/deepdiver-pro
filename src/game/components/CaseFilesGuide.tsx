import { useState } from "react";
import type { Seed } from "../../data/schema";
import { FAMILY_ICONS, FAMILY_LABELS } from "../../data/schema";
import { FEATURED_FAMILY, unitState } from "../engine/curriculum";
import { caseFileMotions, type CaseFileMotion } from "../engine/caseFiles";
import { useCurriculum } from "../store/useCurriculum";

interface Props {
  seed: Seed;
  onHome: () => void;
  onDrill: (lessonId: string) => void;
}

export function CaseFilesGuide({ seed, onHome, onDrill }: Props) {
  const completed = useCurriculum((s) => s.completed);
  const motions = caseFileMotions(seed.cards);
  const unit = unitState(seed.cards, FEATURED_FAMILY, completed);

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display flex items-center gap-2 text-2xl font-black tracking-tight text-[var(--ink)]">
            <span aria-hidden="true">{FAMILY_ICONS[FEATURED_FAMILY]}</span>
            Case Files
          </h1>
          <p className="text-sm text-[var(--text-dim)]">
            Real Devin customer wins — the 7 plays that took the podium
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onHome}
        className="text-sm font-semibold text-[var(--accent-ink)] underline-offset-2 hover:underline"
      >
        &larr; Back
      </button>

      <p className="font-telemetry text-xs text-[var(--text-faint)]">
        {motions.length} GTM motions · {unit.done}/{unit.total} lessons studied
      </p>

      <ul className="space-y-3">
        {motions.map((m) => (
          <MotionCard
            key={m.lessonId}
            motion={m}
            mastered={Boolean(completed[m.lessonId])}
            onDrill={() => onDrill(m.lessonId)}
          />
        ))}
      </ul>
    </div>
  );
}

function MotionCard({
  motion,
  mastered,
  onDrill,
}: {
  motion: CaseFileMotion;
  mastered: boolean;
  onDrill: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `casefile-${motion.lessonId}`;

  return (
    <li className="overflow-hidden rounded-2xl border-2 border-[var(--ink)] bg-[var(--card)] gp-shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--card-2)] min-h-[44px]"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-bg)] font-telemetry text-sm font-bold text-[var(--accent-ink)]"
        >
          {motion.index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold leading-tight text-[var(--ink)]">
            {motion.motion}
          </span>
          <span className="mt-0.5 block truncate text-xs text-[var(--text-dim)]">
            {motion.customers.join(" · ")}
          </span>
        </span>
        {mastered && (
          <span
            className="flex-shrink-0 text-[var(--success)]"
            aria-label="Mastered"
            title="Mastered"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
        <svg
          className={`h-4 w-4 flex-shrink-0 text-[var(--text-faint)] transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div id={panelId} className="space-y-3 border-t border-[var(--border)] px-4 py-3 animate-card-deal">
          {motion.cards.map((c) => (
            <div key={c.id} className="rounded-xl bg-[var(--card-2)] p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-[var(--accent-ink)]">
                  {c.customer ?? FAMILY_LABELS[FEATURED_FAMILY]}
                </span>
              </div>
              {c.proofMetric && (
                <p className="mt-1 text-xs font-semibold text-[var(--success)]">
                  Outcome · {c.proofMetric}
                </p>
              )}
              <p className="mt-2 text-xs italic text-[var(--text-dim)]">
                &ldquo;{c.prompt}&rdquo;
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[var(--ink)]">
                <span className="font-semibold text-[var(--text-faint)]">Play — </span>
                {c.angle}
              </p>
            </div>
          ))}

          <button
            type="button"
            onClick={onDrill}
            data-testid={`drill-${motion.lessonId}`}
            className="font-display w-full rounded-xl border-2 border-[var(--ink)] bg-[var(--accent)] py-3 text-center text-sm font-bold uppercase tracking-wide text-white gp-shadow-sm gp-press min-h-[44px]"
          >
            Drill this motion
          </button>
        </div>
      )}
    </li>
  );
}
