// Exercise-format layer. The same card library powers many exercise shapes,
// which multiplies perceived variety far beyond raw card count. Every format
// reuses existing card fields (no new content required) and resolves to the
// one progress ledger. See docs/CONTENT_SCALING.md.
import type { Card, Persona } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { AnswerOption } from "./session";
import { difficultyForBox, selectDistractors } from "./distractors";
import type { DistractorCandidate } from "./distractors";

function reframeCandidates(card: Card, allCards: Card[]): DistractorCandidate[] {
  return allCards
    .filter((c) => c.id !== card.id)
    .map((c) => ({ text: c.reframe, family: c.family, tier: c.tier }));
}

// Per-card formats served inside the standard round flow. Speed round,
// match-pairs and objection-volley are structurally different and handled by
// their own components/flows.
export type ExerciseFormat =
  | "classic"
  | "whos-speaking"
  | "spot-weak";

export const FORMAT_LABELS: Record<ExerciseFormat, string> = {
  classic: "Read the room",
  "whos-speaking": "Who's speaking?",
  "spot-weak": "Spot the weak answer",
};

const PERSONAS: Persona[] = ["CTO", "VPE", "CFO", "CRO"];

// Deliberately weak reframes — the anti-patterns CONTENT_STYLE warns against
// (overclaiming, dismissive, hand-wavy). Used only as the wrong-to-emulate
// option in "spot the weak answer".
export const WEAK_REFRAMES: string[] = [
  "Honestly, the AI is smart enough to just figure it out on its own.",
  "Don't overthink it — just let the tool run and trust the output.",
  "That's not really a concern; the model basically never makes mistakes.",
  "You're worrying too much — everyone's doing this now, so it's fine.",
  "We can skip the review step; it only slows things down anyway.",
  "It'll replace most of that manual work, so headcount won't matter.",
];

function seededShuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface WhosSpeakingRound {
  format: "whos-speaking";
  line: string;
  correctPersona: Persona;
  options: AnswerOption[];
}

// Show one persona-shift framing; the player identifies which stakeholder it
// speaks to. Trains multi-threading across CTO/VPE/CFO/CRO.
export function buildWhosSpeaking(card: Card, rand: () => number = Math.random): WhosSpeakingRound {
  const persona = seededShuffle(PERSONAS, rand)[0];
  const line = card.personaShift[persona];
  const options: AnswerOption[] = PERSONAS.map((p) => ({
    text: p,
    correct: p === persona,
  }));
  return { format: "whos-speaking", line, correctPersona: persona, options };
}

// Three genuinely-strong reframes plus one deliberately weak line; the player
// finds the weak one. Trains the judgment that separates good sellers.
export function buildSpotWeak(
  card: Card,
  allCards: Card[],
  rand: () => number = Math.random,
  box: number = 1,
): { format: "spot-weak"; options: AnswerOption[] } {
  const weak = seededShuffle(WEAK_REFRAMES, rand)[0];
  // The two "strong but not this one" foils are the reframes most confusable
  // with THIS card's reframe, so the weak line doesn't stand out by topic.
  const { hardness } = difficultyForBox(box);
  const strongers = selectDistractors(
    { family: card.family, tier: card.tier, correct: card.reframe },
    reframeCandidates(card, allCards),
    2,
    hardness,
    rand,
  );
  const strong = [card.reframe, ...strongers];
  const options: AnswerOption[] = [
    { text: weak, correct: true }, // "correct" = the weak one you must find
    ...strong.map((text) => ({ text, correct: false })),
  ];
  return { format: "spot-weak", options: seededShuffle(options, rand) };
}

// For objection-volley: the card's own reframe is correct; distractors are
// other cards' reframes (plausible-but-wrong for THIS objection).
export function buildReframeOptions(
  card: Card,
  allCards: Card[],
  rand: () => number = Math.random,
  box: number = 1,
): AnswerOption[] {
  const { hardness } = difficultyForBox(box);
  const distractors = selectDistractors(
    { family: card.family, tier: card.tier, correct: card.reframe },
    reframeCandidates(card, allCards),
    3,
    hardness,
    rand,
  );
  const options: AnswerOption[] = [
    { text: card.reframe, correct: true },
    ...distractors.map((text) => ({ text, correct: false })),
  ];
  return seededShuffle(options, rand);
}

// Format rotation. Spaced repetition selects WHICH cards appear; format is
// layered on top. Rule: never serve the same format more than twice in a row.
export function rotateFormats(
  count: number,
  pool: ExerciseFormat[],
  rand: () => number = Math.random,
): ExerciseFormat[] {
  const out: ExerciseFormat[] = [];
  for (let i = 0; i < count; i++) {
    const candidates = pool.filter((f) => {
      const n = out.length;
      return !(n >= 2 && out[n - 1] === f && out[n - 2] === f);
    });
    const choices = candidates.length ? candidates : pool;
    out.push(choices[Math.floor(rand() * choices.length)]);
  }
  return out;
}

// Tier-1 cards ask "which family?" — spot-weak/who's-speaking still work on any
// tier since they use the reframe/persona fields present on every card.
export function formatPoolForMode(mode: string): ExerciseFormat[] {
  switch (mode) {
    case "boss-deals":
      // hard, judgment-heavy formats
      return ["classic", "spot-weak"];
    case "family-focus":
      // deep review formats
      return ["whos-speaking", "classic"];
    default:
      // quick drill mixes for variety
      return ["classic", "whos-speaking", "spot-weak"];
  }
}

export function whosSpeakingLineLabel(card: Card): string {
  return FAMILY_LABELS[card.family];
}
