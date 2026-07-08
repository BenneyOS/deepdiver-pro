import { useEffect, useRef, useState } from "react";
import { ParticleBurst } from "./ParticleBurst";

interface HudProps {
  dealNumber: number;
  totalDeals: number;
  streak: number;
  score: number;
}

// The turbo/boost meter fills over a 5-correct chain; hitting a full bar is a
// signature "2× coins" moment. Purely a visual read of the existing streak.
const BOOST_CHAIN = 5;

export function Hud({ dealNumber, totalDeals, streak, score }: HudProps) {
  const prevScore = useRef(score);
  const prevStreak = useRef(streak);
  const [scoreAnim, setScoreAnim] = useState(false);
  const [boostFlare, setBoostFlare] = useState(false);
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
      setBoostFlare(true);
      setShowBurst(true);
      const t1 = setTimeout(() => setBoostFlare(false), 500);
      const t2 = setTimeout(() => setShowBurst(false), 600);
      prevStreak.current = streak;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    prevStreak.current = streak;
  }, [streak]);

  const boostSteps = streak % BOOST_CHAIN === 0 && streak > 0 ? BOOST_CHAIN : streak % BOOST_CHAIN;
  const boostPct = (boostSteps / BOOST_CHAIN) * 100;
  const boostFull = streak > 0 && streak % BOOST_CHAIN === 0;

  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-2 py-3">
      {/* Lap counter */}
      <div className="font-display text-sm font-bold uppercase tracking-wide text-[var(--text-dim)]">
        Lap{" "}
        <span className="font-telemetry text-[var(--ink)]">{dealNumber}</span>
        <span className="text-[var(--text-faint)]">/{totalDeals}</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Boost / turbo meter */}
        <div
          className={`flex items-center gap-1.5 ${boostFlare ? "animate-boost-flare" : ""}`}
          aria-label={`Turbo boost ${boostSteps} of ${BOOST_CHAIN}`}
        >
          <span
            className={`text-sm ${boostFull ? "text-[var(--race-red)]" : "text-[var(--turbo-gold)]"}`}
            aria-hidden="true"
          >
            &#9889;
          </span>
          <div className="gp-boost-track relative w-14">
            <div className="gp-boost-fill" style={{ width: `${boostPct}%` }} />
            <ParticleBurst active={showBurst} color="var(--turbo-gold)" count={6} />
          </div>
        </div>

        {/* Coins */}
        <div className={`flex items-center gap-1 ${scoreAnim ? "animate-points-glow" : ""}`}>
          <span className="text-sm text-[var(--turbo-gold)]" aria-hidden="true">&#9679;</span>
          <span className="font-telemetry text-sm font-bold text-[var(--ink)]">{score}</span>
        </div>
      </div>
    </div>
  );
}
