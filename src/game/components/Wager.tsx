import type { Wager as WagerType } from "../engine/scoring";

interface WagerProps {
  onWager: (wager: WagerType) => void;
}

export function Wager({ onWager }: WagerProps) {
  return (
    <div className="mx-auto w-full max-w-md animate-section-enter" role="group" aria-label="Confidence wager" style={{ animationDelay: "100ms" }}>
      <p className="mb-4 text-center text-sm font-medium text-[var(--text-dim)]" id="wager-label">
        How confident are you?
      </p>
      <div className="flex gap-3" role="radiogroup" aria-labelledby="wager-label">
        <button
          type="button"
          onClick={() => onWager("hunch")}
          aria-label="Hunch — 1 times points multiplier"
          className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 text-center transition-all hover:border-[var(--text-dim)] active:scale-[0.97] min-h-[44px]"
          style={{ transitionTimingFunction: "var(--ease-standard)" }}
        >
          <div className="text-lg font-bold text-[var(--ink)]">
            Hunch
          </div>
          <div className="font-telemetry text-xs text-[var(--text-faint)]">&times;1 points</div>
        </button>
        <button
          type="button"
          onClick={() => onWager("read-the-room")}
          aria-label="Read the Room — 2 times points multiplier"
          className="flex-1 rounded-2xl bg-[var(--accent)] px-4 py-4 text-center shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.97] min-h-[44px]"
          style={{ transitionTimingFunction: "var(--ease-standard)" }}
        >
          <div className="text-lg font-bold text-white">Read the Room</div>
          <div className="font-telemetry text-xs text-white/60">&times;2 points</div>
        </button>
      </div>
    </div>
  );
}
