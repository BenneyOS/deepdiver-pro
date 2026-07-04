interface MomentumMeterProps {
  momentum: number;
}

export function MomentumMeter({ momentum }: MomentumMeterProps) {
  const rounded = Math.round(momentum);
  const isHot = momentum >= 75;
  const isCold = momentum < 40;

  const dotCount = 5;
  const filledDots = Math.round((momentum / 100) * dotCount);

  return (
    <div
      className="mx-auto flex w-full max-w-md items-center justify-between px-2 py-1"
      role="meter"
      aria-label="Momentum"
      aria-valuenow={rounded}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span className="text-xs text-[var(--text-faint)]">Momentum</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: dotCount }, (_, i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
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
        <span className={`font-telemetry text-xs font-bold ${
          isHot ? "text-[var(--accent-ink)] animate-momentum-pulse" : isCold ? "text-[var(--danger)]" : "text-[var(--text-dim)]"
        }`}>
          {rounded}%
        </span>
      </div>
    </div>
  );
}
