import type { Card, Family, Persona, Tier } from "../../data/schema";
import type { ExerciseFormat } from "./formats";
import {
  buildWhosSpeaking,
  buildSpotWeak,
  FORMAT_LABELS,
} from "./formats";
import { difficultyForBox, selectDistractors } from "./distractors";
import type { DistractorCandidate } from "./distractors";

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

// Tier 1 no longer asks "which family?" — inside a unit lesson the family is
// already known, so that was a giveaway. Instead we ask for the specific
// PATTERN, discriminating against sibling patterns from the same family.
const TIER_QUESTIONS: Record<Tier, string> = {
  1: "Which pattern is playing out here?",
  2: "What is the root cause beneath this symptom?",
  3: "What is the sharpest diagnostic question to ask?",
  4: "What is the best way to reframe this objection?",
};

function getCorrectAnswer(card: Card): string {
  switch (card.tier) {
    case 1:
      return card.pattern;
    case 2:
      return card.rootCause;
    case 3:
      return card.diagnostic;
    case 4:
      return card.reframe;
  }
}

function tierField(card: Card): string {
  return getCorrectAnswer(card);
}

// Candidates carry family/tier so the distractor engine can favour confusable,
// same-family near-misses over random unrelated answers.
function getDistractorCandidates(card: Card, allCards: Card[]): DistractorCandidate[] {
  return allCards
    .filter((c) => c.id !== card.id)
    .map((c) => ({ text: tierField(c), family: c.family, tier: c.tier }));
}

function shuffleArray<T>(arr: T[], rand: () => number = Math.random): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateOptions(
  card: Card,
  allCards: Card[],
  opts: { box?: number; rand?: () => number } = {},
): AnswerOption[] {
  const rand = opts.rand ?? Math.random;
  const { distractorCount, hardness } = difficultyForBox(opts.box ?? 1);
  const correct = getCorrectAnswer(card);
  const distractors = selectDistractors(
    { family: card.family, tier: card.tier, correct },
    getDistractorCandidates(card, allCards),
    distractorCount,
    hardness,
    rand,
  );

  const options: AnswerOption[] = [
    { text: correct, correct: true },
    ...distractors.map((text) => ({ text, correct: false })),
  ];

  return shuffleArray(options, rand);
}

export function buildRound(
  card: Card,
  allCards: Card[],
  format: ExerciseFormat = "classic",
  rand: () => number = Math.random,
  box: number = 1,
  recentWeak: string[] = [],
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
      const r = buildSpotWeak(card, allCards, rand, box, recentWeak);
      return {
        ...base,
        options: r.options,
        showQuote: false,
        instruction: "Three of these are solid. Which is the weak answer to avoid?",
        usesWager: false,
      };
    }
    case "classic":
    default:
      return {
        ...base,
        options: generateOptions(card, allCards, { box, rand }),
        showQuote: true,
        instruction: TIER_QUESTIONS[card.tier],
        usesWager: true,
      };
  }
}
