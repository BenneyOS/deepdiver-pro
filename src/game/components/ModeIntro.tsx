import type { Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { SessionMode } from "../engine/session";
import { Ada } from "./Ada";

interface ModeIntroProps {
  mode: SessionMode;
  focusFamily: Family | null;
  onStart: () => void;
  onCancel: () => void;
}

interface ModeCopy {
  name: string;
  desc: string;
  points: string[];
}

function getCopy(mode: SessionMode, focusFamily: Family | null): ModeCopy {
  switch (mode) {
    case "boss-deals":
      return {
        name: "Boss Deals",
        desc: "The toughest reads, back to back. 12 deals weighted to the hardest tiers — sharp questions and live objections.",
        points: [
          "12 hard deals — mostly tier 3–4 (diagnostics + objections).",
          "Streak matters — chain correct reads for bonus; one miss resets.",
          "Earn your rank — score 9+ to hit Senior Seller.",
        ],
      };
    case "family-focus":
      return {
        name: "Family Focus",
        desc: focusFamily
          ? `Drill ${FAMILY_LABELS[focusFamily]} until it's second nature.`
          : "Drill one situation family until it's second nature.",
        points: [
          "Every card from one family, in one sitting.",
          "Streak matters — chain correct reads for bonus; one miss resets.",
          "Great for shoring up a weak spot fast.",
        ],
      };
    default:
      return {
        name: "Quick Drill",
        desc: "7 cards, picked to target your weak spots.",
        points: [
          "7 cards, chosen by spaced repetition to hit what you most need.",
          "Streak matters — chain correct reads for bonus; one miss resets.",
          "A fast, focused warm-up.",
        ],
      };
  }
}

export function ModeIntro({ mode, focusFamily, onStart, onCancel }: ModeIntroProps) {
  const copy = getCopy(mode, focusFamily);

  return (
    <div className="mx-auto w-full max-w-md space-y-5 animate-card-deal">
      <div className="flex items-center gap-3">
        <Ada expression="neutral" size={44} />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">
            {copy.name}
          </h1>
          <p className="text-sm text-[var(--text-dim)]">{copy.desc}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
          How it works
        </p>
        <ul className="space-y-3">
          {copy.points.map((point, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-bg)] text-xs font-bold text-[var(--accent-ink)]">
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed text-[var(--text)]">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3">
        <p className="text-xs text-[var(--text-dim)]">
          <span className="font-semibold text-[var(--success)]">Cleared cards always count</span>{" "}
          toward your path — no matter which mode you play.
        </p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-2xl bg-[var(--accent)] py-4 text-center font-bold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.97] min-h-[44px]"
          style={{ transitionTimingFunction: "var(--ease-spring)" }}
        >
          Start
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="w-full rounded-2xl py-3 text-center text-sm font-medium text-[var(--text-dim)] transition-colors hover:text-[var(--ink)] min-h-[44px]"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
