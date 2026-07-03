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

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      {/* Header */}
      <div className="rounded-2xl bg-[var(--ink-light)] p-6 text-center shadow-xl">
        <div className="text-6xl font-black text-[var(--accent)]">{grade}</div>
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

      {/* Family mastery bars */}
      {familyStats.size > 0 && (
        <div className="rounded-2xl bg-[var(--ink-light)] p-4 shadow-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Family Mastery
          </p>
          <div className="space-y-2">
            {([...familyStats.entries()] as [Family, { seen: number; hit: number }][]).map(
              ([family, stats]) => {
                const pct =
                  stats.seen > 0
                    ? Math.round((stats.hit / stats.seen) * 100)
                    : 0;
                return (
                  <div key={family}>
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
                        className="h-full rounded-full bg-[var(--accent)] transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onHome}
          className="flex-1 rounded-xl bg-slate-700 py-4 font-bold text-[var(--text-primary)] transition-colors hover:bg-slate-600 min-h-[44px]"
        >
          Home
        </button>
        <button
          type="button"
          onClick={onReplay}
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
    <div className="rounded-xl bg-[var(--ink-light)] p-3 text-center shadow">
      <div className="text-xl font-bold text-[var(--accent)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}
