import type { Wager as WagerType } from "../engine/scoring";

interface WagerProps {
  onWager: (wager: WagerType) => void;
}

export function Wager({ onWager }: WagerProps) {
  return (
    <div className="mx-auto w-full max-w-md animate-section-enter" role="group" aria-label="Confidence wager" style={{ animationDelay: "100ms" }}>
      <p className="mb-4 text-center text-sm font-medium text-[var(--text-dim)]" id="wager-label">
        How hard do you push?
      </p>
      <div className="flex gap-3" role="radiogroup" aria-labelledby="wager-label">
        <button
          type="button"
          onClick={() => onWager("hunch")}
          aria-label="Coast — 1 times coins multiplier"
          className="flex-1 rounded-2xl border-2 border-[var(--ink)] bg-[var(--card)] px-4 py-4 text-center gp-shadow-sm gp-press min-h-[44px]"
        >
          <div className="font-display text-lg font-black text-[var(--ink)]">
            Coast
          </div>
          <div className="font-telemetry text-xs text-[var(--text-faint)]">&times;1 coins</div>
        </button>
        <button
          type="button"
          onClick={() => onWager("read-the-room")}
          aria-label="Full throttle — 2 times coins multiplier"
          className="font-display flex-1 rounded-2xl border-2 border-[var(--ink)] bg-[var(--accent)] px-4 py-4 text-center gp-shadow gp-press min-h-[44px]"
        >
          <div className="text-lg font-black text-white">Full throttle</div>
          <div className="font-telemetry text-xs text-white/70">&times;2 coins</div>
        </button>
      </div>
    </div>
  );
}
