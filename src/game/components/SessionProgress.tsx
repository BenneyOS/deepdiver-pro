interface SessionProgressProps {
  current: number;
  total: number;
}

// The honest, discrete lap track — one segment per deal, filled as you cross
// each finish line. Never a fake percentage (RESKIN_PRD honest-metrics rule).
export function SessionProgress({ current, total }: SessionProgressProps) {
  return (
    <div className="mx-auto w-full max-w-md px-2" aria-label={`Lap ${current} of ${total}`}>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-display font-bold uppercase tracking-wide text-[var(--text-dim)]">Lap</span>
        <span className="font-telemetry font-semibold text-[var(--ink)]">{current} of {total}</span>
      </div>
      <div className="flex items-center gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i < current ? "bg-[var(--race-red)]" : "bg-[var(--border)]"
            }`}
            aria-hidden="true"
          />
        ))}
        {/* Checkered finish marker */}
        <span
          className="ml-0.5 h-3.5 w-3.5 flex-shrink-0 rounded-[3px]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, var(--ink) 25%, transparent 25%, transparent 75%, var(--ink) 75%), linear-gradient(45deg, var(--ink) 25%, transparent 25%, transparent 75%, var(--ink) 75%)",
            backgroundSize: "6px 6px",
            backgroundPosition: "0 0, 3px 3px",
            backgroundColor: "var(--card)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
