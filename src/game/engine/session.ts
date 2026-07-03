import type { Card, Family, Tier } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";

export type SessionMode = "quick-drill" | "boss-deals" | "family-focus";

export interface AnswerOption {
  text: string;
  correct: boolean;
}

export interface Round {
  card: Card;
  options: AnswerOption[];
  tierLabel: string;
}

export interface SessionConfig {
  mode: SessionMode;
  cardCount: number;
  focusFamily?: Family;
}

export const SESSION_CONFIGS: Record<SessionMode, Omit<SessionConfig, "focusFamily">> = {
  "quick-drill": { mode: "quick-drill", cardCount: 7 },
  "boss-deals": { mode: "boss-deals", cardCount: 12 },
  "family-focus": { mode: "family-focus", cardCount: 7 },
};

const TIER_QUESTIONS: Record<Tier, string> = {
  1: "Which situation family does this describe?",
  2: "What is the root cause beneath this symptom?",
  3: "What is the sharpest diagnostic question to ask?",
  4: "What is the best way to reframe this objection?",
};

function getCorrectAnswer(card: Card): string {
  switch (card.tier) {
    case 1:
      return FAMILY_LABELS[card.family];
    case 2:
      return card.rootCause;
    case 3:
      return card.diagnostic;
    case 4:
      return card.reframe;
  }
}

function getDistractorPool(card: Card, allCards: Card[]): string[] {
  const others = allCards.filter((c) => c.id !== card.id);

  switch (card.tier) {
    case 1: {
      const families = new Set(others.map((c) => FAMILY_LABELS[c.family]));
      families.delete(FAMILY_LABELS[card.family]);
      return [...families];
    }
    case 2:
      return others.map((c) => c.rootCause);
    case 3:
      return others.map((c) => c.diagnostic);
    case 4:
      return others.map((c) => c.reframe);
  }
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateOptions(
  card: Card,
  allCards: Card[],
  distractorCount: number = 3,
): AnswerOption[] {
  const correct = getCorrectAnswer(card);
  const pool = getDistractorPool(card, allCards);
  const uniqueDistractors = [...new Set(pool)].filter((d) => d !== correct);
  const selected = shuffleArray(uniqueDistractors).slice(0, distractorCount);

  const options: AnswerOption[] = [
    { text: correct, correct: true },
    ...selected.map((text) => ({ text, correct: false })),
  ];

  return shuffleArray(options);
}

export function buildRound(card: Card, allCards: Card[]): Round {
  return {
    card,
    options: generateOptions(card, allCards),
    tierLabel: TIER_QUESTIONS[card.tier],
  };
}
