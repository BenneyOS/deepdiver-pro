interface HudProps {
  dealNumber: number;
  totalDeals: number;
  streak: number;
  score: number;
}

export function Hud({ dealNumber, totalDeals, streak, score }: HudProps) {
  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between px-2 py-3">
      <div className="text-sm text-[var(--text-secondary)]">
        Deal{" "}
        <span className="font-bold text-[var(--text-primary)]">
          {dealNumber}
        </span>
        /{totalDeals}
      </div>
      <div className="flex items-center gap-4">
        {streak > 0 && (
          <div className="text-sm text-[var(--text-secondary)]">
            Streak{" "}
            <span className="font-bold text-amber-400">{streak}</span>
          </div>
        )}
        <div className="text-sm text-[var(--text-secondary)]">
          <span className="font-bold text-[var(--accent)]">{score}</span> pts
        </div>
      </div>
    </div>
  );
}
