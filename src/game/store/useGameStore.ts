import { create } from "zustand";
import type { Card, Family, Seed } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { Wager, RoundResult } from "../engine/scoring";
import type { Round, SessionMode } from "../engine/session";
import {
  roundPoints,
  nextStreak,
  nextMomentum,
} from "../engine/scoring";
import { selectSessionQueue, selectBossDealsQueue, selectFamilyFocusQueue } from "../engine/leitner";
import { updateProgress } from "../engine/leitner";
import { isCleared, isMastered, clearedInFamily, unlockThresholdFor } from "../engine/progress";
import { buildRound } from "../engine/session";
import type { ExerciseFormat } from "../engine/formats";
import { rotateFormats, formatPoolForMode } from "../engine/formats";
import { useProgressStore } from "./useProgressStore";
import { usePortfolio } from "./usePortfolio";
import { feedbackCorrect, feedbackWrong, feedbackReward } from "../feedback";
import { useSessionHistory } from "./useSessionHistory";
import { useStreak } from "./useStreak";
import { trackEvent } from "../analytics";

export type GamePhase =
  | "home"
  | "intro"
  | "answer"
  | "wager"
  | "reveal"
  | "speed"
  | "volley"
  | "match"
  | "portfolio"
  | "scorecard";

export interface ClearEvent {
  family: Family;
  familyLabel: string;
  clearedCount: number;
  familyTotal: number;
  didUnlock: boolean;
}

interface GameState {
  phase: GamePhase;
  mode: SessionMode;
  queue: Card[];
  formats: ExerciseFormat[];
  currentIndex: number;
  currentRound: Round | null;
  selectedAnswer: number | null;
  selectedWager: Wager | null;
  isCorrect: boolean | null;
  score: number;
  streak: number;
  maxStreak: number;
  momentum: number;
  hits: number;
  rounds: RoundResult[];
  allCards: Card[];
  clearEvent: ClearEvent | null;

  focusFamily: Family | null;
  pendingMode: SessionMode;
  pendingFamily: Family | null;

  prepareSession: (mode: SessionMode, focusFamily?: Family) => void;
  startSession: (seed: Seed, mode: SessionMode, focusFamily?: Family) => void;
  selectAnswer: (optionIndex: number) => void;
  placeWager: (wager: Wager) => void;
  submitAssembly: (correct: boolean) => void;
  recordAnswer: (card: Card, correct: boolean) => void;
  finishSpeed: (summary: { mode: SessionMode; score: number; hits: number; total: number; maxStreak: number }) => void;
  nextRound: () => void;
  goHome: () => void;
  openPortfolio: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "home",
  mode: "quick-drill",
  queue: [],
  formats: [],
  currentIndex: 0,
  currentRound: null,
  selectedAnswer: null,
  selectedWager: null,
  isCorrect: null,
  score: 0,
  streak: 0,
  maxStreak: 0,
  momentum: 50,
  hits: 0,
  rounds: [],
  allCards: [],
  clearEvent: null,
  focusFamily: null,
  pendingMode: "quick-drill",
  pendingFamily: null,

  prepareSession: (mode: SessionMode, focusFamily?: Family) => {
    set({
      phase: "intro",
      pendingMode: mode,
      pendingFamily: focusFamily ?? null,
    });
  },

  startSession: (seed: Seed, mode: SessionMode, focusFamily?: Family) => {
    const progressMap = useProgressStore.getState().progressMap;
    let queue: Card[];

    switch (mode) {
      case "boss-deals":
        queue = selectBossDealsQueue(seed.cards, progressMap, 12);
        break;
      case "family-focus":
        queue = selectFamilyFocusQueue(
          seed.cards,
          progressMap,
          focusFamily ?? "A",
          7,
        );
        break;
      case "speed-round": {
        // Rapid family-ID against a large pool; self-contained "speed" phase.
        const q = selectSessionQueue(seed.cards, progressMap, Math.min(60, seed.cards.length));
        trackEvent({ event: "session_started", properties: { mode } });
        set({ ...freshSessionState(), phase: "speed", mode, queue: q, allCards: seed.cards });
        return;
      }
      case "objection-volley": {
        // Chain of 3 objections from one family; a miss ends the volley.
        const fam =
          focusFamily ??
          selectSessionQueue(seed.cards, progressMap, 1)[0]?.family ??
          "A";
        const q = selectFamilyFocusQueue(seed.cards, progressMap, fam, 3);
        trackEvent({ event: "session_started", properties: { mode, focusFamily: fam } });
        set({ ...freshSessionState(), phase: "volley", mode, queue: q, allCards: seed.cards });
        return;
      }
      case "match-pairs": {
        // Match symptoms to their root causes across 4 cards, validate at once.
        const q = selectSessionQueue(seed.cards, progressMap, 4);
        trackEvent({ event: "session_started", properties: { mode } });
        set({ ...freshSessionState(), phase: "match", mode, queue: q, allCards: seed.cards });
        return;
      }
      default:
        queue = selectSessionQueue(seed.cards, progressMap, 7);
        break;
    }
    const allCards = seed.cards;
    const formats = rotateFormats(queue.length, formatPoolForMode(mode));
    const firstRound =
      queue.length > 0 ? buildRound(queue[0], allCards, formats[0]) : null;

    trackEvent({
      event: "session_started",
      properties: { mode, focusFamily },
    });

    set({
      focusFamily: focusFamily ?? null,
      phase: "answer",
      mode,
      queue,
      formats,
      currentIndex: 0,
      currentRound: firstRound,
      selectedAnswer: null,
      selectedWager: null,
      isCorrect: null,
      score: 0,
      streak: 0,
      maxStreak: 0,
      momentum: 50,
      hits: 0,
      rounds: [],
      allCards,
      clearEvent: null,
    });
  },

  selectAnswer: (optionIndex: number) => {
    const round = get().currentRound;
    // Classic uses the confidence wager; other formats resolve immediately.
    if (round?.usesWager) {
      set({ selectedAnswer: optionIndex, phase: "wager" });
      return;
    }
    set({ selectedAnswer: optionIndex });
    const correct = round?.options[optionIndex]?.correct ?? false;
    resolveRound(get, set, correct, "hunch");
  },

  placeWager: (wager: Wager) => {
    const state = get();
    const round = state.currentRound;
    if (!round || state.selectedAnswer === null) return;
    const correct = round.options[state.selectedAnswer].correct;
    resolveRound(get, set, correct, wager);
  },

  submitAssembly: (correct: boolean) => {
    // build-reframe: no options, correctness computed by the component.
    set({ selectedAnswer: correct ? 0 : -1 });
    resolveRound(get, set, correct, "hunch");
  },

  // Speed round, objection-volley and match-pairs all write to the same ledger
  // as every other format: a first correct answer clears the card and can
  // unlock the next unit.
  recordAnswer: (card: Card, correct: boolean) => {
    trackEvent({
      event: "round_completed",
      properties: {
        cardId: card.id,
        family: card.family,
        tier: card.tier,
        format: "classic",
        correct,
        wager: "hunch",
        points: correct ? 10 : 0,
      },
    });
    const progressStore = useProgressStore.getState();
    const currentProgress = progressStore.getProgress(card.id);
    const wasCleared = isCleared(currentProgress);
    const wasMastered = isMastered(currentProgress);
    const nextProgress = updateProgress(currentProgress, card.id, correct);
    progressStore.updateCard(nextProgress);
    const newlyMastered = !wasMastered && isMastered(nextProgress);
    if (newlyMastered) {
      usePortfolio.getState().capture(card, FAMILY_LABELS[card.family]);
    }
    if (newlyMastered) feedbackReward();
    else if (correct) feedbackCorrect();
    else feedbackWrong();
    if (correct && !wasCleared) {
      const updatedMap = useProgressStore.getState().progressMap;
      const familyTotal = get().allCards.filter((c) => c.family === card.family).length;
      const clearedCount = clearedInFamily(get().allCards, updatedMap, card.family);
      trackEvent({
        event: "card_cleared",
        properties: {
          cardId: card.id,
          family: card.family,
          clearedCount,
          didUnlock: clearedCount === unlockThresholdFor(familyTotal),
        },
      });
    }
  },

  finishSpeed: ({ mode, score, hits, total, maxStreak }) => {
    useSessionHistory.getState().addSession({ mode, score, hits, total, maxStreak });
    useStreak.getState().recordPlay();
    trackEvent({
      event: "session_completed",
      properties: {
        mode,
        score,
        hits,
        total,
        maxStreak,
        accuracy: total > 0 ? Math.round((hits / total) * 100) : 0,
      },
    });
  },

  nextRound: () => {
    const state = get();
    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= state.queue.length) {
      // Record completed session to history
      useSessionHistory.getState().addSession({
        mode: state.mode,
        score: state.score,
        hits: state.hits,
        total: state.queue.length,
        maxStreak: state.maxStreak,
      });
      useStreak.getState().recordPlay();
      const accuracy = state.queue.length > 0 ? (state.hits / state.queue.length) * 100 : 0;
      trackEvent({
        event: "session_completed",
        properties: {
          mode: state.mode,
          score: state.score,
          hits: state.hits,
          total: state.queue.length,
          maxStreak: state.maxStreak,
          accuracy: Math.round(accuracy),
        },
      });
      set({ phase: "scorecard" });
      return;
    }

    const nextCard = state.queue[nextIndex];
    const nextRound = buildRound(nextCard, state.allCards, state.formats[nextIndex]);

    set({
      phase: "answer",
      currentIndex: nextIndex,
      currentRound: nextRound,
      selectedAnswer: null,
      selectedWager: null,
      isCorrect: null,
    });
  },

  goHome: () => {
    set({
      phase: "home",
      queue: [],
      currentIndex: 0,
      currentRound: null,
      selectedAnswer: null,
      selectedWager: null,
      isCorrect: null,
      score: 0,
      streak: 0,
      maxStreak: 0,
      momentum: 50,
      hits: 0,
      rounds: [],
    });
  },

  openPortfolio: () => {
    set({ phase: "portfolio" });
  },
}));

// Reset fields shared by every session start.
function freshSessionState(): Partial<GameState> {
  return {
    focusFamily: null,
    formats: [],
    currentIndex: 0,
    currentRound: null,
    selectedAnswer: null,
    selectedWager: null,
    isCorrect: null,
    score: 0,
    streak: 0,
    maxStreak: 0,
    momentum: 50,
    hits: 0,
    rounds: [],
    clearEvent: null,
  };
}

// Shared round resolution — every format (classic, who's-speaking, spot-weak,
// build-reframe) funnels through here, so all write identical round_completed
// and card_cleared events to the one progress ledger.
function resolveRound(
  get: () => GameState,
  set: (partial: Partial<GameState>) => void,
  correct: boolean,
  wager: Wager,
): void {
  const state = get();
  const round = state.currentRound;
  if (!round) return;

  const points = roundPoints(correct, round.card.tier, wager);
  const newStreak = nextStreak(correct, state.streak);
  const newMomentum = nextMomentum(correct, wager, state.momentum);

  const result: RoundResult = {
    correct,
    tier: round.card.tier,
    wager,
    points,
  };

  trackEvent({
    event: "round_completed",
    properties: {
      cardId: round.card.id,
      family: round.card.family,
      tier: round.card.tier,
      format: round.format,
      correct,
      wager,
      points,
    },
  });

  // Update the one progress ledger. The first correct answer to a card
  // clears it permanently in ANY mode/format and moves the path.
  const progressStore = useProgressStore.getState();
  const currentProgress = progressStore.getProgress(round.card.id);
  const wasCleared = isCleared(currentProgress);
  const wasMastered = isMastered(currentProgress);
  const newProgress = updateProgress(currentProgress, round.card.id, correct);
  progressStore.updateCard(newProgress);

  if (!wasMastered && isMastered(newProgress)) {
    usePortfolio.getState().capture(round.card, FAMILY_LABELS[round.card.family]);
  }

  let clearEvent: ClearEvent | null = null;
  if (correct && !wasCleared) {
    const family = round.card.family;
    const updatedMap = useProgressStore.getState().progressMap;
    const familyTotal = state.allCards.filter((c) => c.family === family).length;
    const clearedCount = clearedInFamily(state.allCards, updatedMap, family);
    const didUnlock = clearedCount === unlockThresholdFor(familyTotal);
    clearEvent = {
      family,
      familyLabel: FAMILY_LABELS[family],
      clearedCount,
      familyTotal,
      didUnlock,
    };
    trackEvent({
      event: "card_cleared",
      properties: { cardId: round.card.id, family, clearedCount, didUnlock },
    });
  }

  set({
    phase: "reveal",
    selectedWager: wager,
    isCorrect: correct,
    score: state.score + points,
    streak: newStreak,
    maxStreak: Math.max(state.maxStreak, newStreak),
    momentum: newMomentum,
    hits: state.hits + (correct ? 1 : 0),
    rounds: [...state.rounds, result],
    clearEvent,
  });
}
