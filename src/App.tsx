import { useEffect, useState, useCallback } from "react";
import type { Seed, Family } from "./data/schema";
import { FAMILY_LABELS } from "./data/schema";
import seedData from "./data/seed.json";
import { useGameStore } from "./game/store/useGameStore";
import { useProgressStore } from "./game/store/useProgressStore";
import { PathHomeScreen } from "./game/components/PathHomeScreen";
import { ModeIntro } from "./game/components/ModeIntro";
import { Hud } from "./game/components/Hud";
import { SessionProgress } from "./game/components/SessionProgress";
import { OptionList } from "./game/components/OptionList";
import { Wager } from "./game/components/Wager";
import { SpeedRound } from "./game/components/SpeedRound";
import { ObjectionVolley } from "./game/components/ObjectionVolley";
import { MatchPairs } from "./game/components/MatchPairs";
import { Reveal } from "./game/components/Reveal";
import { Scorecard } from "./game/components/Scorecard";
import { PitchPortfolio } from "./game/components/PitchPortfolio";
import { AgenticLog } from "./game/components/AgenticLog";
import { Ada } from "./game/components/Ada";
import {
  starsForAccuracy,
  lessonsForFamily,
  unitUnlockThreshold,
  nextLessonOverall,
  nextLessonInUnit,
  isUnitUnlocked,
} from "./game/engine/curriculum";
import { useCurriculum } from "./game/store/useCurriculum";

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
          onStartLesson={(lessonId) => game.startLesson(seed, lessonId)}
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
    // Did finishing this lesson just unlock the next unit? True when it was the
    // lesson at the unlock threshold (e.g. the 3rd) and a next unit exists.
    const unlockedUnitLabel = ((): string | null => {
      if (game.mode !== "lesson" || !game.activeLessonId) return null;
      const [fam, lPart] = game.activeLessonId.split("-L");
      const idxInUnit = Number(lPart);
      if (Number.isNaN(idxInUnit)) return null;
      const families = Object.keys(seed.families) as Family[];
      const famIdx = families.indexOf(fam as Family);
      if (famIdx < 0 || famIdx >= families.length - 1) return null;
      const total = lessonsForFamily(seed.cards, fam as Family).length;
      const threshold = unitUnlockThreshold(total);
      return idxInUnit + 1 === threshold ? FAMILY_LABELS[families[famIdx + 1]] : null;
    })();

    // Post-lesson curriculum state (completeLesson already ran before this phase),
    // used to point "Continue" at the next lesson and offer a lateral module jump.
    const isLesson = game.mode === "lesson" && !!game.activeLessonId;
    const completed = useCurriculum.getState().completed;
    const allFamilies = Object.keys(seed.families) as Family[];
    const currentFamily = isLesson
      ? (game.activeLessonId!.split("-L")[0] as Family)
      : null;

    // "Continue" plays the next incomplete lesson anywhere on the path.
    const continueLesson = isLesson
      ? nextLessonOverall(seed.cards, allFamilies, completed)
      : null;
    const continueLabel = continueLesson
      ? continueLesson.family === currentFamily
        ? `Lesson ${continueLesson.index + 1}`
        : FAMILY_LABELS[continueLesson.family]
      : null;

    // A *different* unlocked module you can jump to instead of continuing this one.
    const otherModule = (() => {
      if (!isLesson) return null;
      for (let i = 0; i < allFamilies.length; i++) {
        const fam = allFamilies[i];
        if (fam === continueLesson?.family) continue;
        if (!isUnitUnlocked(seed.cards, allFamilies, i, completed)) continue;
        const next = nextLessonInUnit(seed.cards, fam, completed);
        if (next) return { label: FAMILY_LABELS[fam], lessonId: next.id };
      }
      return null;
    })();

    return (
      <main className="flex min-h-screen flex-col items-center bg-[var(--page)] px-4 py-8 animate-screen-in" aria-label="Scorecard">
        <Scorecard
          score={game.score}
          maxStreak={game.maxStreak}
          hits={game.hits}
          rounds={game.rounds}
          queue={game.queue}
          onHome={() => game.goHome()}
          onReplay={() =>
            game.mode === "lesson" && game.activeLessonId
              ? game.startLesson(seed, game.activeLessonId)
              : game.startSession(seed, game.mode)
          }
          continueLabel={continueLabel}
          onContinue={
            continueLesson
              ? () => game.startLesson(seed, continueLesson.id)
              : undefined
          }
          otherModuleLabel={otherModule?.label ?? null}
          onTryAnotherModule={
            otherModule
              ? () => game.startLesson(seed, otherModule.lessonId)
              : undefined
          }
          lessonStars={
            game.mode === "lesson"
              ? starsForAccuracy(game.hits, game.queue.length)
              : null
          }
          unlockedUnitLabel={unlockedUnitLabel}
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

            {game.phase === "answer" && (
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
