import { useEffect, useRef, useState } from "react";
import { ParticleBurst } from "./ParticleBurst";

interface HudProps {
  dealNumber: number;
  totalDeals: number;
  streak: number;
  score: number;
}

export function Hud({ dealNumber, totalDeals, streak, score }: HudProps) {
  const prevScore = useRef(score);
  const prevStreak = useRef(streak);
  const [scoreAnim, setScoreAnim] = useState(false);
  const [streakAnim, setStreakAnim] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  useEffect(() => {
    if (score > prevScore.current) {
      setScoreAnim(true);
      const t = setTimeout(() => setScoreAnim(false), 600);
      prevScore.current = score;
      return () => clearTimeout(t);
    }
    prevScore.current = score;
  }, [score]);

  useEffect(() => {
    if (streak > prevStreak.current && streak > 0) {
      setStreakAnim(true);
      setShowBurst(true);
      const t1 = setTimeout(() => setStreakAnim(false), 400);
      const t2 = setTimeout(() => setShowBurst(false), 600);
      prevStreak.current = streak;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    prevStreak.current = streak;
  }, [streak]);

  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between px-2 py-3">
      <div className="font-telemetry text-sm text-[var(--text-dim)]">
        Deal{" "}
        <span className="font-bold text-[var(--ink)]">
          {dealNumber}
        </span>
        /{totalDeals}
      </div>
      <div className="flex items-center gap-4">
        {streak > 0 && (
          <div className={`relative ${streakAnim ? "animate-streak-pop" : ""}`}>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-bg)] px-2.5 py-1 text-xs font-bold text-[var(--accent-ink)]">
              <span aria-hidden="true">&#x1F525;</span>
              {streak}
            </span>
            <ParticleBurst active={showBurst} color="var(--accent)" count={6} />
          </div>
        )}
        <div className={`font-telemetry text-sm ${scoreAnim ? "animate-points-glow" : ""}`}>
          <span className="font-bold text-[var(--ink)]">{score}</span>
          <span className="text-[var(--text-faint)]"> pts</span>
        </div>
      </div>
    </div>
  );
}
