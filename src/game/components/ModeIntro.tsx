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
        name: "Championship Cup",
        desc: "The toughest reads, back to back. 12 laps weighted to the hardest tiers — sharp questions and live objections.",
        points: [
          "12 hard laps — mostly tier 3–4 (diagnostics + objections).",
          "Turbo boost — chain correct reads to fill the meter; one miss resets it.",
          "Race for the podium — score 9+ to take Champion tier.",
        ],
      };
    case "speed-round":
      return {
        name: "Time Trial",
        desc: "60 seconds on the clock. Read as many circuits as you can — fast reads only.",
        points: [
          "60-second timer — answer as many as you can.",
          "No wager — chain correct reads for a rising boost multiplier.",
          "Every correct first read still clears the card on your map.",
        ],
      };
    case "objection-volley":
      return {
        name: "Versus",
        desc: "Three tough objections from one circuit, head to head. Fire back with the strongest reframe — one miss ends the run.",
        points: [
          "3 objections in a row from a single circuit.",
          "Pick the strongest reframe each time — a miss ends the run.",
          "Clear all three for a rising boost payoff.",
        ],
      };
    case "match-pairs":
      return {
        name: "Match Pairs",
        desc: "Connect each symptom to the root cause beneath it — a fast review of the diagnostic logic.",
        points: [
          "Tap a symptom, then tap the root cause it maps to.",
          "Match all four, then check them at once.",
          "Correct matches clear those cards on your map.",
        ],
      };
    case "family-focus":
      return {
        name: "Circuit Focus",
        desc: focusFamily
          ? `Drill ${FAMILY_LABELS[focusFamily]} until it's second nature.`
          : "Drill one circuit until it's second nature.",
        points: [
          "Every card from one circuit, in one sitting.",
          "Turbo boost — chain correct reads to fill the meter; one miss resets it.",
          "Great for shoring up a weak spot fast.",
        ],
      };
    default:
      return {
        name: "Practice Lap",
        desc: "7 cards, picked to target your weak spots.",
        points: [
          "7 cards, chosen by spaced repetition to hit what you most need.",
          "Turbo boost — chain correct reads to fill the meter; one miss resets it.",
          "A fast, focused warm-up lap.",
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
          <h1 className="font-display text-2xl font-black tracking-tight text-[var(--ink)]">
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
          className="font-display w-full rounded-2xl border-2 border-[var(--ink)] bg-[var(--accent)] py-4 text-center font-bold uppercase tracking-wide text-white gp-shadow gp-press min-h-[44px]"
        >
          Start engines
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
