import type { Wager as WagerType } from "../engine/scoring";

interface WagerProps {
  onWager: (wager: WagerType) => void;
}

export function Wager({ onWager }: WagerProps) {
  return (
    <div className="mx-auto w-full max-w-md animate-card-deal" role="group" aria-label="Confidence wager">
      <p className="mb-4 text-center text-sm font-medium text-[var(--text-secondary)]" id="wager-label">
        How confident are you?
      </p>
      <div className="flex gap-3" role="radiogroup" aria-labelledby="wager-label">
        <button
          type="button"
          onClick={() => onWager("hunch")}
          aria-label="Hunch — 1 times points multiplier"
          className="flex-1 rounded-xl bg-slate-700 px-4 py-4 text-center transition-colors hover:bg-slate-600 min-h-[44px]"
        >
          <div className="text-lg font-bold text-[var(--text-primary)]">
            Hunch
          </div>
          <div className="text-xs text-[var(--text-muted)]">&times;1 points</div>
        </button>
        <button
          type="button"
          onClick={() => onWager("read-the-room")}
          aria-label="Read the Room — 2 times points multiplier"
          className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-4 text-center transition-colors hover:bg-blue-700 min-h-[44px]"
        >
          <div className="text-lg font-bold text-white">Read the Room</div>
          <div className="text-xs text-blue-200">&times;2 points</div>
        </button>
      </div>
    </div>
  );
}
