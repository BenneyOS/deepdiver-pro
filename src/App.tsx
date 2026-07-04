import { useEffect, useState, useCallback } from "react";
import type { Seed } from "./data/schema";
import seedData from "./data/seed.json";
import { useGameStore } from "./game/store/useGameStore";
import { useProgressStore } from "./game/store/useProgressStore";
import { PathHomeScreen } from "./game/components/PathHomeScreen";
import { Hud } from "./game/components/Hud";
import { SessionProgress } from "./game/components/SessionProgress";
import { OptionList } from "./game/components/OptionList";
import { Wager } from "./game/components/Wager";
import { Reveal } from "./game/components/Reveal";
import { Scorecard } from "./game/components/Scorecard";
import { AgenticLog } from "./game/components/AgenticLog";
import { Ada } from "./game/components/Ada";

const seed = seedData as Seed;

function App() {
  const { hydrate, initialized } = useProgressStore();
  const game = useGameStore();
  const [showLog, setShowLog] = useState(false);
  const [logKey, setLogKey] = useState(0);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleNextRound = useCallback(() => {
    const isLast = game.currentIndex === game.queue.length - 1;
    if (!isLast && game.currentIndex > 0 && game.currentIndex % 3 === 0) {
      setShowLog(true);
      setLogKey((k) => k + 1);
    } else {
      game.nextRound();
    }
  }, [game]);

  const handleLogComplete = useCallback(() => {
    setShowLog(false);
    game.nextRound();
  }, [game]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--page)]" role="status" aria-label="Loading">
        <Ada expression="thinking" size={48} />
        <p className="ml-3 text-[var(--text-faint)]">Loading&hellip;</p>
      </div>
    );
  }

  if (game.phase === "home") {
    return (
      <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-8">
        <PathHomeScreen
          seed={seed}
          onStart={(mode, focusFamily) => game.startSession(seed, mode, focusFamily)}
        />
      </main>
    );
  }

  if (game.phase === "scorecard") {
    return (
      <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-8" aria-label="Scorecard">
        <Scorecard
          score={game.score}
          maxStreak={game.maxStreak}
          hits={game.hits}
          rounds={game.rounds}
          queue={game.queue}
          onHome={() => game.goHome()}
          onReplay={() => game.startSession(seed, game.mode)}
        />
      </main>
    );
  }

  const round = game.currentRound;
  if (!round) return null;

  if (showLog) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--page)] px-4 py-4">
        <AgenticLog
          key={logKey}
          hits={game.hits}
          total={game.currentIndex + 1}
          streak={game.streak}
          onComplete={handleLogComplete}
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-4" aria-label={`Round ${game.currentIndex + 1} of ${game.queue.length}`}>
      <Hud
        dealNumber={game.currentIndex + 1}
        totalDeals={game.queue.length}
        streak={game.streak}
        score={game.score}
      />
      {/* FIX 2: Segmented session progress (discrete pips) */}
      <SessionProgress
        current={game.currentIndex + 1}
        total={game.queue.length}
      />

      <div className="mt-4 w-full space-y-4">
        {game.phase === "reveal" && game.isCorrect !== null && game.selectedWager ? (
          <Reveal
            card={round.card}
            correct={game.isCorrect}
            wager={game.selectedWager}
            streak={game.streak}
            options={round.options}
            selectedIndex={game.selectedAnswer!}
            onNext={handleNextRound}
            isLastRound={game.currentIndex === game.queue.length - 1}
          />
        ) : (
          <>
            <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm animate-card-deal" key={game.currentIndex}>
              <blockquote className="border-l-2 border-[var(--accent)] pl-4 text-lg leading-relaxed text-[var(--ink)] font-buyer-quote">
                &ldquo;{round.card.prompt}&rdquo;
              </blockquote>
            </div>

            {game.phase === "answer" && (
              <OptionList
                options={round.options}
                tierLabel={round.tierLabel}
                selectedIndex={game.selectedAnswer}
                onSelect={(i) => game.selectAnswer(i)}
                disabled={game.selectedAnswer !== null}
              />
            )}

            {game.phase === "wager" && (
              <Wager onWager={(w) => game.placeWager(w)} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default App;
