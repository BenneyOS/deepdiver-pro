import { useState, useEffect } from "react";
import type { Card, Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { RoundResult } from "../engine/scoring";
import { rankFromAccuracy, gradeFromAccuracy } from "../engine/scoring";
import { Ada } from "./Ada";
import { ParticleBurst } from "./ParticleBurst";

interface ScorecardProps {
  score: number;
  maxStreak: number;
  hits: number;
  rounds: RoundResult[];
  queue: Card[];
  onHome: () => void;
  onReplay: () => void;
  /** When set, this was a curriculum lesson: show the completion + star banner. */
  lessonStars?: number | null;
}

export function Scorecard({
  score,
  maxStreak,
  hits,
  rounds,
  queue,
  onHome,
  onReplay,
  lessonStars = null,
}: ScorecardProps) {
  const total = rounds.length;
  const accuracy = total > 0 ? (hits / total) * 100 : 0;
  const rank = rankFromAccuracy(accuracy);
  const grade = gradeFromAccuracy(accuracy);
  const [animated, setAnimated] = useState(false);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">("idle");
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimated(true), 100);
    const t2 = setTimeout(() => setShowBurst(true), 300);
    const t3 = setTimeout(() => setShowBurst(false), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

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
      `Read the Room \u2014 ${grade} (${rank})`,
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
        // User cancelled or share failed
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      setShareStatus("error");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  }

  const adaExpression = accuracy >= 80 ? "impressed" : accuracy >= 50 ? "pleased" : "neutral";
  const adaComment = accuracy >= 80
    ? `New rank: ${rank}.`
    : accuracy >= 50
      ? "Solid session. Keep drilling."
      : "Start your first read.";

  return (
    <div className="mx-auto w-full max-w-md space-y-5" aria-label="Session scorecard">
      {/* Lesson-complete banner — the path just advanced by one lesson */}
      {lessonStars !== null && (
        <div
          className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent-bg)] p-4 text-center animate-rank-spring"
          role="status"
        >
          <p className="text-sm font-bold text-[var(--accent-ink)]">Lesson complete</p>
          <p className="mt-1 text-2xl" aria-label={`${lessonStars} of 3 stars`}>
            <span className="text-[var(--accent)]">{"\u2605".repeat(Math.max(0, Math.min(3, lessonStars)))}</span>
            <span className="text-[var(--text-faint)]">{"\u2606".repeat(3 - Math.max(0, Math.min(3, lessonStars)))}</span>
          </p>
          <p className="mt-1 text-xs text-[var(--text-dim)]">
            {lessonStars >= 3
              ? "Flawless — that read is now second nature."
              : "Path advanced. Replay for 3 stars to lock it in."}
          </p>
        </div>
      )}

      {/* Rank-up header */}
      <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <div className="relative inline-block animate-rank-spring">
          <div className="font-telemetry text-6xl font-black text-[var(--ink)]" aria-label={`Grade: ${grade}`}>
            {grade}
          </div>
          <ParticleBurst active={showBurst} color="var(--accent)" count={10} />
        </div>
        <div className="mt-2 text-xl font-bold text-[var(--ink)]">
          {rank}
        </div>
        <div className="font-telemetry mt-1 text-sm text-[var(--text-faint)]">
          {Math.round(accuracy)}% accuracy
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <Ada expression={adaExpression as "neutral" | "pleased" | "thinking" | "impressed" | "unbothered"} size={32} />
          <p className="text-sm text-[var(--text-dim)] italic">&ldquo;{adaComment}&rdquo;</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 animate-section-enter" style={{ animationDelay: "200ms" }}>
        <StatBox label="Score" value={String(score)} />
        <StatBox label="Best Streak" value={String(maxStreak)} />
        <StatBox label="Correct" value={`${hits}/${total}`} />
      </div>

      {/* Family mastery bars */}
      {familyStats.size > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 animate-section-enter" style={{ animationDelay: "400ms" }}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
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
                      <span className="text-[var(--text-dim)]">
                        {FAMILY_LABELS[family]}
                      </span>
                      <span className="font-telemetry font-bold text-[var(--ink)]">
                        {pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all"
                        style={{
                          width: animated ? `${pct}%` : "0%",
                          transitionDuration: `${800 + idx * 150}ms`,
                          transitionDelay: `${400 + idx * 100}ms`,
                          transitionTimingFunction: "var(--ease-standard)",
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
        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] py-3 font-bold text-[var(--ink)] transition-all hover:bg-[var(--card-2)] active:scale-[0.98] min-h-[44px]"
        style={{ transitionTimingFunction: "var(--ease-standard)" }}
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
          className="flex-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] py-4 font-bold text-[var(--ink)] transition-all hover:bg-[var(--card-2)] active:scale-[0.98] min-h-[44px]"
          style={{ transitionTimingFunction: "var(--ease-standard)" }}
        >
          Home
        </button>
        <button
          type="button"
          onClick={onReplay}
          aria-label="Play another session"
          className="flex-1 rounded-2xl bg-[var(--accent)] py-4 font-bold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.98] min-h-[44px]"
          style={{ transitionTimingFunction: "var(--ease-standard)" }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-center" aria-label={`${label}: ${value}`}>
      <div className="font-telemetry text-xl font-bold text-[var(--ink)]">{value}</div>
      <div className="text-xs text-[var(--text-faint)]">{label}</div>
    </div>
  );
}
