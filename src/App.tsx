import { useEffect, useState, useCallback } from "react";
import type { Seed } from "./data/schema";
import seedData from "./data/seed.json";
import { useGameStore } from "./game/store/useGameStore";
import { useProgressStore } from "./game/store/useProgressStore";
import { PathHomeScreen } from "./game/components/PathHomeScreen";
import { ModeIntro } from "./game/components/ModeIntro";
import { Hud } from "./game/components/Hud";
import { SessionProgress } from "./game/components/SessionProgress";
import { OptionList } from "./game/components/OptionList";
import { Wager } from "./game/components/Wager";
import { BuildReframe } from "./game/components/BuildReframe";
import { SpeedRound } from "./game/components/SpeedRound";
import { ObjectionVolley } from "./game/components/ObjectionVolley";
import { MatchPairs } from "./game/components/MatchPairs";
import { Reveal } from "./game/components/Reveal";
import { Scorecard } from "./game/components/Scorecard";
import { PitchPortfolio } from "./game/components/PitchPortfolio";
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
      <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-8 animate-screen-in">
        <PathHomeScreen
          seed={seed}
          onStart={(mode, focusFamily) => game.prepareSession(mode, focusFamily)}
          onOpenPortfolio={() => game.openPortfolio()}
        />
      </main>
    );
  }

  if (game.phase === "portfolio") {
    return (
      <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-8 animate-screen-in" aria-label="Pitch Portfolio">
        <PitchPortfolio onHome={() => game.goHome()} />
      </main>
    );
  }

  if (game.phase === "intro") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--page)] px-4 py-8 animate-screen-in">
        <ModeIntro
          mode={game.pendingMode}
          focusFamily={game.pendingFamily}
          onStart={() => game.startSession(seed, game.pendingMode, game.pendingFamily ?? undefined)}
          onCancel={() => game.goHome()}
        />
      </main>
    );
  }

  if (game.phase === "speed") {
    return (
      <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-6 animate-screen-in" aria-label="Speed Round">
        <SpeedRound onHome={() => game.goHome()} />
      </main>
    );
  }

  if (game.phase === "volley") {
    return (
      <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-6 animate-screen-in" aria-label="Objection Volley">
        <ObjectionVolley onHome={() => game.goHome()} />
      </main>
    );
  }

  if (game.phase === "match") {
    return (
      <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-6 animate-screen-in" aria-label="Match Pairs">
        <MatchPairs onHome={() => game.goHome()} />
      </main>
    );
  }

  if (game.phase === "scorecard") {
    return (
      <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-8 animate-screen-in" aria-label="Scorecard">
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
            clearEvent={game.clearEvent}
            onNext={handleNextRound}
            isLastRound={game.currentIndex === game.queue.length - 1}
          />
        ) : (
          <>
            {round.showQuote && (
              <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm animate-card-deal" key={game.currentIndex}>
                <blockquote className="border-l-2 border-[var(--accent)] pl-4 text-lg leading-relaxed text-[var(--ink)] font-buyer-quote">
                  &ldquo;{round.card.prompt}&rdquo;
                </blockquote>
              </div>
            )}

            {round.promptOverride && (
              <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm animate-card-deal" key={`p-${game.currentIndex}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
                  The pitch says&hellip;
                </p>
                <p className="mt-1.5 text-base leading-relaxed text-[var(--ink)]">
                  &ldquo;{round.promptOverride}&rdquo;
                </p>
              </div>
            )}

            {game.phase === "answer" && round.format === "build-reframe" && (
              <BuildReframe
                key={game.currentIndex}
                tokens={round.reframeTokens ?? []}
                correctOrder={round.reframeOrder ?? []}
                instruction={round.instruction}
                onSubmit={(correct) => game.submitAssembly(correct)}
              />
            )}

            {game.phase === "answer" && round.format !== "build-reframe" && (
              <OptionList
                options={round.options}
                tierLabel={round.instruction}
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
