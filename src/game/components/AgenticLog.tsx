import { useState, useEffect } from "react";
import { Ada } from "./Ada";

interface AgenticLogProps {
  hits: number;
  total: number;
  streak: number;
  momentum: number;
  onComplete: () => void;
}

function generateLogLines(hits: number, total: number, streak: number, momentum: number): string[] {
  const lines: string[] = [];

  lines.push(`reading your last ${total} answers\u2026`);

  const accuracy = total > 0 ? Math.round((hits / total) * 100) : 0;

  if (accuracy >= 80) {
    lines.push("strong pattern recognition detected");
  } else if (accuracy >= 50) {
    lines.push("building steady diagnostic instinct");
  } else {
    lines.push("calibrating to your learning curve");
  }

  if (streak >= 3) {
    lines.push(`${streak}-streak momentum \u2014 raising difficulty`);
  }

  if (momentum >= 75) {
    lines.push("you're hot \u2014 queuing harder scenarios");
  } else if (momentum <= 30) {
    lines.push("easing up \u2014 reinforcing fundamentals");
  }

  lines.push("selecting next scenario\u2026");

  return lines;
}

export function AgenticLog({ hits, total, streak, momentum, onComplete }: AgenticLogProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = generateLogLines(hits, total, streak, momentum);

  useEffect(() => {
    if (visibleLines < lines.length) {
      const timer = setTimeout(() => {
        setVisibleLines((v) => v + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
    const completeTimer = setTimeout(onComplete, 600);
    return () => clearTimeout(completeTimer);
  }, [visibleLines, lines.length, onComplete]);

  return (
    <div className="mx-auto w-full max-w-md animate-card-deal">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <div className="mb-4 flex items-center gap-3">
          <Ada expression="thinking" size={36} />
          <span className="text-sm font-medium text-[var(--text-dim)]">Ada is thinking&hellip;</span>
        </div>
        <div className="space-y-2 font-telemetry">
          {lines.slice(0, visibleLines).map((line, i) => (
            <p
              key={i}
              className="animate-log-line text-xs text-[var(--text-dim)]"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-[var(--accent-ink)]">&#9656;</span>{" "}
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
