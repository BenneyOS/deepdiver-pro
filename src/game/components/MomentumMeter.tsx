interface MomentumMeterProps {
  momentum: number;
  streak: number;
}

function momentumLabel(momentum: number): string {
  if (momentum >= 75) return "On fire";
  if (momentum >= 50) return "Warm";
  if (momentum >= 30) return "Building";
  return "Cold";
}

export function MomentumMeter({ momentum, streak }: MomentumMeterProps) {
  const isHot = momentum >= 75;
  const isCold = momentum < 30;
  const label = momentumLabel(momentum);

  const dotCount = 5;
  const filledDots = Math.round((momentum / 100) * dotCount);

  return (
    <div
      className="mx-auto flex w-full max-w-md items-center justify-end gap-3 px-2 py-1"
      role="status"
      aria-label={`Momentum: ${label}`}
    >
      {streak > 0 && (
        <span className="text-xs text-[var(--text-faint)]">
          {streak} in a row
        </span>
      )}
      <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5" aria-hidden="true">
          {Array.from({ length: dotCount }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                i < filledDots
                  ? isHot
                    ? "bg-[var(--accent)]"
                    : isCold
                      ? "bg-[var(--danger)]"
                      : "bg-[var(--text-dim)]"
                  : "bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${
          isHot ? "text-[var(--accent-ink)]" : isCold ? "text-[var(--danger)]" : "text-[var(--text-faint)]"
        }`}>
          {label}
        </span>
      </div>
    </div>
  );
}
