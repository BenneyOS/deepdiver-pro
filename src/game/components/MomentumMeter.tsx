interface MomentumMeterProps {
  momentum: number;
}

function meterColor(momentum: number): string {
  if (momentum >= 75) return "bg-green-500";
  if (momentum >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export function MomentumMeter({ momentum }: MomentumMeterProps) {
  const rounded = Math.round(momentum);
  return (
    <div className="mx-auto w-full max-w-md px-2" role="meter" aria-label="Deal Momentum" aria-valuenow={rounded} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Deal Momentum</span>
        <span className={`font-bold text-[var(--text-primary)] ${momentum >= 75 ? "animate-momentum-pulse" : ""}`}>
          {rounded}%
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${meterColor(momentum)}`}
          style={{ width: `${momentum}%` }}
        />
      </div>
    </div>
  );
}
