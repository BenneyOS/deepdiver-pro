import { useState } from "react";
import type { Persona } from "../../data/schema";
import { usePortfolio, pitchShareText, type PitchEntry } from "../store/usePortfolio";
import { Ada } from "./Ada";

interface Props {
  onHome: () => void;
}

const PERSONA_ORDER: Persona[] = ["CTO", "VPE", "CFO", "CRO"];

export function PitchPortfolio({ onHome }: Props) {
  const pitches = usePortfolio((s) => s.pitches);

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">
            Pitch Portfolio
          </h1>
          <p className="text-sm text-[var(--text-dim)]">
            Every read you&rsquo;ve mastered, yours to keep
          </p>
        </div>
        <Ada expression={pitches.length > 0 ? "pleased" : "neutral"} size={44} />
      </div>

      <button
        type="button"
        onClick={onHome}
        className="text-sm font-semibold text-[var(--accent-ink)] underline-offset-2 hover:underline"
      >
        &larr; Back
      </button>

      {pitches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 text-center">
          <p className="text-sm text-[var(--text-dim)]">
            No mastered pitches yet. Master a diagnostic (answer it right across a
            few sessions) and its winning pitch lands here — a collection you own
            and can share.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs font-telemetry text-[var(--text-faint)]">
            {pitches.length} mastered {pitches.length === 1 ? "pitch" : "pitches"}
          </p>
          <ul className="space-y-3">
            {pitches.map((p) => (
              <PitchCard key={p.cardId} pitch={p} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function PitchCard({ pitch }: { pitch: PitchEntry }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const text = pitchShareText(pitch);
    try {
      if (navigator.share) {
        await navigator.share({ title: pitch.pattern, text });
        return;
      }
    } catch {
      // user dismissed the share sheet; fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable; nothing else we can do
    }
  }

  return (
    <li className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
            {pitch.familyLabel}
          </span>
          <h2 className="mt-0.5 font-bold leading-snug text-[var(--ink)]">
            {pitch.pattern}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="shrink-0 rounded-full bg-[var(--accent-bg)] px-3 py-1.5 text-xs font-bold text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent)] hover:text-white min-h-[36px]"
          aria-label="Share this pitch"
        >
          {copied ? "Copied" : "Share"}
        </button>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
        <span className="font-semibold text-[var(--text-dim)]">The reframe: </span>
        {pitch.reframe}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-1.5">
        {PERSONA_ORDER.map((k) => (
          <div key={k} className="text-xs leading-relaxed text-[var(--text-dim)]">
            <span className="font-telemetry font-semibold text-[var(--accent-ink)]">{k}</span>{" "}
            {pitch.personaShift[k]}
          </div>
        ))}
      </div>
    </li>
  );
}
