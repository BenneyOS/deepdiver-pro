import { useState, useEffect } from "react";
import type { Card, Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { RoundResult } from "../engine/scoring";
import { rankFromAccuracy, gradeFromAccuracy } from "../engine/scoring";

interface ScorecardProps {
  score: number;
  maxStreak: number;
  hits: number;
  rounds: RoundResult[];
  queue: Card[];
  onHome: () => void;
  onReplay: () => void;
}

export function Scorecard({
  score,
  maxStreak,
  hits,
  rounds,
  queue,
  onHome,
  onReplay,
}: ScorecardProps) {
  const total = rounds.length;
  const accuracy = total > 0 ? (hits / total) * 100 : 0;
  const rank = rankFromAccuracy(accuracy);
  const grade = gradeFromAccuracy(accuracy);
  const [animated, setAnimated] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Per-family mastery
  const familyStats = new Map<Family, { seen: number; hit: number }>();
  for (let i = 0; i < rounds.length; i++) {
    const card = queue[i];
    const round = rounds[i];
    const fam = card.family;
    const stats = familyStats.get(fam) ?? { seen: 0, hit: 0 };
    stats.seen += 1;
    stats.hit += round.correct ? 1 : 0;
    familyStats.set(fam, stats);
  }

  function buildShareText(): string {
    const familyLines = [...familyStats.entries()]
      .map(([fam, stats]) => {
        const pct = stats.seen > 0 ? Math.round((stats.hit / stats.seen) * 100) : 0;
        return `  ${FAMILY_LABELS[fam]}: ${pct}%`;
      })
      .join("\n");

    return [
      `Read the Room — ${grade} (${rank})`,
      `Score: ${score} | ${hits}/${total} correct | Best streak: ${maxStreak}`,
      `Accuracy: ${Math.round(accuracy)}%`,
      "",
      "Family Mastery:",
      familyLines,
      "",
      "readtheroom.app",
    ].join("\n");
  }

  async function handleShare(): Promise<void> {
    const text = buildShareText();

    if (navigator.share) {
      try {
        await navigator.share({ title: "Read the Room Scorecard", text });
        setShareStatus("copied");
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-5 animate-card-deal" aria-label="Session scorecard">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--ink-light)] p-6 text-center shadow-xl">
        <div className="text-6xl font-black text-[var(--accent)]" aria-label={`Grade: ${grade}`}>
          {grade}
        </div>
        <div className="mt-2 text-xl font-bold text-[var(--text-primary)]">
          {rank}
        </div>
        <div className="mt-1 text-sm text-[var(--text-muted)]">
          {Math.round(accuracy)}% accuracy
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="Score" value={String(score)} />
        <StatBox label="Best Streak" value={String(maxStreak)} />
        <StatBox label="Correct" value={`${hits}/${total}`} />
      </div>

      {/* Family mastery bars with animated fill */}
      {familyStats.size > 0 && (
        <div className="rounded-2xl bg-[var(--ink-light)] p-4 shadow-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Family Mastery
          </p>
          <div className="space-y-2">
            {([...familyStats.entries()] as [Family, { seen: number; hit: number }][]).map(
              ([family, stats], idx) => {
                const pct =
                  stats.seen > 0
                    ? Math.round((stats.hit / stats.seen) * 100)
                    : 0;
                return (
                  <div key={family} role="meter" aria-label={`${FAMILY_LABELS[family]} mastery`} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">
                        {FAMILY_LABELS[family]}
                      </span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all ease-out"
                        style={{
                          width: animated ? `${pct}%` : "0%",
                          transitionDuration: `${800 + idx * 150}ms`,
                          transitionDelay: `${200 + idx * 100}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Share button */}
      <button
        type="button"
        onClick={handleShare}
        aria-label="Copy scorecard to clipboard or share"
        className="w-full rounded-xl bg-slate-700 py-3 font-bold text-[var(--text-primary)] transition-colors hover:bg-slate-600 min-h-[44px]"
      >
        {shareStatus === "copied"
          ? "Copied!"
          : shareStatus === "error"
            ? "Could not copy"
            : "Share Scorecard"}
      </button>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onHome}
          aria-label="Return to home screen"
          className="flex-1 rounded-xl bg-slate-700 py-4 font-bold text-[var(--text-primary)] transition-colors hover:bg-slate-600 min-h-[44px]"
        >
          Home
        </button>
        <button
          type="button"
          onClick={onReplay}
          aria-label="Play another session"
          className="flex-1 rounded-xl bg-[var(--accent)] py-4 font-bold text-white transition-colors hover:bg-blue-700 min-h-[44px]"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--ink-light)] p-3 text-center shadow" aria-label={`${label}: ${value}`}>
      <div className="text-xl font-bold text-[var(--accent)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}
