import type { Card, Family, Persona, Tier } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { ExerciseFormat, ReframeToken } from "./formats";
import {
  buildWhosSpeaking,
  buildSpotWeak,
  buildReframeAssembly,
  FORMAT_LABELS,
} from "./formats";

export type SessionMode =
  | "lesson"
  | "quick-drill"
  | "boss-deals"
  | "family-focus"
  | "speed-round"
  | "objection-volley"
  | "match-pairs";

export interface AnswerOption {
  text: string;
  correct: boolean;
}

export interface Round {
  card: Card;
  format: ExerciseFormat;
  options: AnswerOption[];
  tierLabel: string;
  // How the prompt is presented. Classic shows the buyer quote; who's-speaking
  // shows a single persona framing and hides the quote.
  showQuote: boolean;
  promptOverride?: string;
  instruction: string;
  usesWager: boolean;
  // build-reframe only
  reframeTokens?: ReframeToken[];
  reframeOrder?: string[];
  correctPersona?: Persona;
}

export interface SessionConfig {
  mode: SessionMode;
  cardCount: number;
  focusFamily?: Family;
}

export const SESSION_CONFIGS: Record<SessionMode, Omit<SessionConfig, "focusFamily">> = {
  "lesson": { mode: "lesson", cardCount: 5 },
  "quick-drill": { mode: "quick-drill", cardCount: 7 },
  "boss-deals": { mode: "boss-deals", cardCount: 12 },
  "family-focus": { mode: "family-focus", cardCount: 7 },
  "speed-round": { mode: "speed-round", cardCount: 40 },
  "objection-volley": { mode: "objection-volley", cardCount: 3 },
  "match-pairs": { mode: "match-pairs", cardCount: 4 },
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

export function buildRound(
  card: Card,
  allCards: Card[],
  format: ExerciseFormat = "classic",
  rand: () => number = Math.random,
): Round {
  const base = {
    card,
    format,
    tierLabel: FORMAT_LABELS[format],
  };

  switch (format) {
    case "whos-speaking": {
      const r = buildWhosSpeaking(card, rand);
      return {
        ...base,
        options: r.options,
        showQuote: false,
        promptOverride: r.line,
        instruction: "Which stakeholder is this framing aimed at?",
        usesWager: false,
        correctPersona: r.correctPersona,
      };
    }
    case "spot-weak": {
      const r = buildSpotWeak(card, allCards, rand);
      return {
        ...base,
        options: r.options,
        showQuote: false,
        instruction: "Three of these are solid. Which is the weak answer to avoid?",
        usesWager: false,
      };
    }
    case "build-reframe": {
      const r = buildReframeAssembly(card, allCards, rand);
      return {
        ...base,
        options: [],
        showQuote: true,
        instruction: "Assemble the strongest reframe, in order.",
        usesWager: false,
        reframeTokens: r.shuffled,
        reframeOrder: r.correctOrder,
      };
    }
    case "classic":
    default:
      return {
        ...base,
        options: generateOptions(card, allCards),
        showQuote: true,
        instruction: TIER_QUESTIONS[card.tier],
        usesWager: true,
      };
  }
}
