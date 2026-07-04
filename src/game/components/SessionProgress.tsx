interface SessionProgressProps {
  current: number;
  total: number;
}

export function SessionProgress({ current, total }: SessionProgressProps) {
  return (
    <div className="mx-auto w-full max-w-md px-2" aria-label={`Session progress: deal ${current} of ${total}`}>
      <div className="flex items-center justify-between text-xs text-[var(--text-dim)] mb-1.5">
        <span>Session progress</span>
        <span className="font-telemetry font-semibold text-[var(--ink)]">{current} of {total}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i < current
                ? "bg-[var(--ink)]"
                : "bg-[var(--border)]"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
