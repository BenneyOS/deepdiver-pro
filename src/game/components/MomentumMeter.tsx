interface MomentumMeterProps {
  momentum: number;
}

function meterColor(momentum: number): string {
  if (momentum >= 75) return "var(--accent)";
  if (momentum >= 40) return "var(--reward)";
  return "var(--danger)";
}

export function MomentumMeter({ momentum }: MomentumMeterProps) {
  const rounded = Math.round(momentum);
  const isHot = momentum >= 75;

  return (
    <div className="mx-auto w-full max-w-md px-2" role="meter" aria-label="Deal Momentum" aria-valuenow={rounded} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex items-center justify-between text-xs text-[var(--text-faint)]">
        <span>Deal Momentum</span>
        <span className={`font-telemetry font-bold text-[var(--text)] ${isHot ? "animate-momentum-pulse" : ""}`}>
          {rounded}%
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--card-2)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${momentum}%`,
            backgroundColor: meterColor(momentum),
            transitionTimingFunction: "var(--ease-standard)",
            boxShadow: isHot ? `0 0 8px ${meterColor(momentum)}` : "none",
          }}
        />
      </div>
    </div>
  );
}
