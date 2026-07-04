import { rankFromAccuracy, gradeFromAccuracy } from "../engine/scoring";

export interface SessionRecord {
  id: string;
  mode: string;
  score: number;
  hits: number;
  total: number;
  maxStreak: number;
  createdAt: string;
}

interface SessionHistoryProps {
  sessions: SessionRecord[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl bg-[var(--card)] p-4 text-center shadow-xl">
        <p className="text-sm text-[var(--text-faint)]">No sessions yet. Start a Quick Drill!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[var(--card)] p-4 shadow-xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
        Recent Sessions
      </p>
      <div className="space-y-2">
        {sessions.slice(0, 10).map((session) => {
          const accuracy = session.total > 0 ? (session.hits / session.total) * 100 : 0;
          const grade = gradeFromAccuracy(accuracy);
          const rank = rankFromAccuracy(accuracy);
          const date = new Date(session.createdAt);
          const dateStr = date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          });

          return (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-xl bg-[var(--card-2)]/50 px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <span className="font-telemetry text-lg font-black text-[var(--accent)]">{grade}</span>
                <div>
                  <p className="text-xs font-medium text-[var(--text)]">{rank}</p>
                  <p className="text-xs text-[var(--text-faint)]">{dateStr} &middot; {session.mode}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-telemetry text-sm font-bold text-[var(--text)]">{session.score}</p>
                <p className="font-telemetry text-xs text-[var(--text-faint)]">{session.hits}/{session.total}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
