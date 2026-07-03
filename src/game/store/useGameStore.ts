import { create } from "zustand";
import type { Card, Seed } from "../../data/schema";
import type { Wager, RoundResult } from "../engine/scoring";
import type { Round, SessionMode } from "../engine/session";
import {
  roundPoints,
  nextStreak,
  nextMomentum,
} from "../engine/scoring";
import { selectSessionQueue } from "../engine/leitner";
import { updateProgress } from "../engine/leitner";
import { buildRound } from "../engine/session";
import { useProgressStore } from "./useProgressStore";

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

  startSession: (seed: Seed, mode: SessionMode) => void;
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

  startSession: (seed: Seed, mode: SessionMode) => {
    const progressMap = useProgressStore.getState().progressMap;
    const count = mode === "boss-deals" ? 12 : 7;
    const queue = selectSessionQueue(seed.cards, progressMap, count);
    const allCards = seed.cards;
    const firstRound = queue.length > 0 ? buildRound(queue[0], allCards) : null;

    set({
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
