import { useEffect } from "react";
import type { Seed } from "./data/schema";
import seedData from "./data/seed.json";
import { useGameStore } from "./game/store/useGameStore";
import { useProgressStore } from "./game/store/useProgressStore";
import { HomeScreen } from "./game/components/HomeScreen";
import { Hud } from "./game/components/Hud";
import { MomentumMeter } from "./game/components/MomentumMeter";
import { OptionList } from "./game/components/OptionList";
import { Wager } from "./game/components/Wager";
import { Reveal } from "./game/components/Reveal";
import { Scorecard } from "./game/components/Scorecard";

const seed = seedData as Seed;

function App() {
  const { hydrate, initialized, progressMap } = useProgressStore();
  const game = useGameStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ink)]">
        <p className="text-[var(--text-muted)]">Loading…</p>
      </div>
    );
  }

  if (game.phase === "home") {
    const cardsSeen = [...progressMap.values()].filter((p) => p.seen > 0).length;
    return (
      <div className="flex min-h-screen flex-col items-center bg-[var(--ink)] px-4 py-8">
        <HomeScreen
          seed={seed}
          cardsSeen={cardsSeen}
          onStart={(mode) => game.startSession(seed, mode)}
        />
      </div>
    );
  }

  if (game.phase === "scorecard") {
    return (
      <div className="flex min-h-screen flex-col items-center bg-[var(--ink)] px-4 py-8">
        <Scorecard
          score={game.score}
          maxStreak={game.maxStreak}
          hits={game.hits}
          rounds={game.rounds}
          queue={game.queue}
          onHome={() => game.goHome()}
          onReplay={() => game.startSession(seed, game.mode)}
        />
      </div>
    );
  }

  const round = game.currentRound;
  if (!round) return null;

  return (
    <div className="flex min-h-screen flex-col items-center bg-[var(--ink)] px-4 py-4">
      <Hud
        dealNumber={game.currentIndex + 1}
        totalDeals={game.queue.length}
        streak={game.streak}
        score={game.score}
      />
      <MomentumMeter momentum={game.momentum} />

      <div className="mt-4 w-full space-y-4">
        {game.phase === "reveal" && game.isCorrect !== null && game.selectedWager ? (
          <Reveal
            card={round.card}
            correct={game.isCorrect}
            wager={game.selectedWager}
            onNext={() => game.nextRound()}
            isLastRound={game.currentIndex === game.queue.length - 1}
          />
        ) : (
          <>
            {/* Scenario card (compact during answer phase) */}
            <div className="mx-auto w-full max-w-md rounded-2xl bg-[var(--ink-light)] p-5 shadow-xl">
              <blockquote className="border-l-4 border-[var(--accent)] pl-4 text-lg leading-relaxed text-[var(--text-primary)] italic">
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
    </div>
  );
}

export default App;
