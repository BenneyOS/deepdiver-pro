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

// Deliberately weak reframes — the anti-patterns CONTENT_STYLE warns against.
// Grouped by the *kind* of bad selling move so the weak option varies in flavour
// (not just wording). One is picked per round (see pickWeakReframe), avoiding
// recently-shown lines so you don't keep seeing the same "just trust it" line.
export const WEAK_REFRAMES: string[] = [
  // Overclaiming the model
  "Honestly, the AI is smart enough to just figure it out on its own.",
  "The model basically never makes mistakes, so validation is overkill.",
  "Its output is right often enough that double-checking is a waste of time.",
  "Trust the AI here — it understands your systems better than your team does.",
  // Dismissing the concern
  "That's not really a concern; nobody serious worries about that anymore.",
  "You're overthinking it — that risk is more theoretical than real.",
  "That fear goes away the moment you see the demo. Just trust me, it works.",
  "Honestly, that objection is a solved problem. Let's not dwell on it.",
  // Hand-waving process / skipping controls
  "Don't overthink it — just let the tool run and trust the output.",
  "We can skip the review step; the gates only slow the rollout down.",
  "Push it straight to production — if something breaks you'll catch it fast.",
  "Let the agent handle it end to end; human oversight just adds friction.",
  // FOMO / social proof
  "Everyone's doing this already, so there's really no risk in just going for it.",
  "Say yes now and we'll figure out the details later — momentum is what matters.",
  "You'll get left behind if you wait to think it through, so let's just start.",
  // Headcount / bravado
  "It'll replace most of that manual work, so those concerns won't matter soon.",
  "We've done this a hundred times; there's nothing here that could go wrong.",
  "Your engineers will love it once it's in — no need to bring them along first.",
];

/**
 * Pick a weak reframe, avoiding any recently-shown ones so the same line
 * doesn't recur across nearby spot-the-weak rounds (the repetition players
 * complained about). Selection is random per appearance — so revisiting the
 * same card no longer shows an identical round — with recent lines filtered out.
 */
export function pickWeakReframe(
  rand: () => number = Math.random,
  recentWeak: string[] = [],
): string {
  const fresh = WEAK_REFRAMES.filter((w) => !recentWeak.includes(w));
  const pool = fresh.length ? fresh : WEAK_REFRAMES;
  return seededShuffle(pool, rand)[0];
}

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
  recentWeak: string[] = [],
): { format: "spot-weak"; options: AnswerOption[] } {
  const weak = pickWeakReframe(rand, recentWeak);
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
// layered on top. Rule: never serve the same format twice in a row.
export function rotateFormats(
  count: number,
  pool: ExerciseFormat[],
  rand: () => number = Math.random,
): ExerciseFormat[] {
  const out: ExerciseFormat[] = [];
  for (let i = 0; i < count; i++) {
    // Never repeat a format back-to-back (when the pool allows it) so a session
    // feels varied rather than serving the same shape twice running.
    const candidates = pool.filter((f) => out.length === 0 || out[out.length - 1] !== f);
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
