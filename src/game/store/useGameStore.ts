import { create } from "zustand";
import type { Card, Family, Seed } from "../../data/schema";
import type { Wager, RoundResult } from "../engine/scoring";
import type { Round, SessionMode } from "../engine/session";
import {
  roundPoints,
  nextStreak,
  nextMomentum,
} from "../engine/scoring";
import { selectSessionQueue, selectBossDealsQueue, selectFamilyFocusQueue } from "../engine/leitner";
import { updateProgress } from "../engine/leitner";
import { buildRound } from "../engine/session";
import { useProgressStore } from "./useProgressStore";
import { useSessionHistory } from "./useSessionHistory";
import { trackEvent } from "../analytics";

export type GamePhase =
  | "home"
  | "answer"
  | "wager"
  | "reveal"
  | "scorecard";

interface GameState {
  phase: GamePhase;
  mode: SessionMode;
  queue: Card[];
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

  focusFamily: Family | null;

  startSession: (seed: Seed, mode: SessionMode, focusFamily?: Family) => void;
  selectAnswer: (optionIndex: number) => void;
  placeWager: (wager: Wager) => void;
  nextRound: () => void;
  goHome: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "home",
  mode: "quick-drill",
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
  allCards: [],
  focusFamily: null,

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
      default:
        queue = selectSessionQueue(seed.cards, progressMap, 7);
        break;
    }
    const allCards = seed.cards;
    const firstRound = queue.length > 0 ? buildRound(queue[0], allCards) : null;

    trackEvent({
      event: "session_started",
      properties: { mode, focusFamily },
    });

    set({
      focusFamily: focusFamily ?? null,
      phase: "answer",
      mode,
      queue,
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
    });
  },

  selectAnswer: (optionIndex: number) => {
    set({ selectedAnswer: optionIndex, phase: "wager" });
  },

  placeWager: (wager: Wager) => {
    const state = get();
    const round = state.currentRound;
    if (!round || state.selectedAnswer === null) return;

    const option = round.options[state.selectedAnswer];
    const correct = option.correct;
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
        correct,
        wager,
        points,
      },
    });

    // Update Leitner progress
    const progressStore = useProgressStore.getState();
    const currentProgress = progressStore.getProgress(round.card.id);
    const newProgress = updateProgress(currentProgress, round.card.id, correct);
    progressStore.updateCard(newProgress);

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
    const nextRound = buildRound(nextCard, state.allCards);

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
}));
