// Distractor-selection engine. The old approach pulled wrong answers at random
// from any card, so options were often from an unrelated domain and trivial to
// eliminate. Here we score every candidate by how *confusable* it is with the
// correct answer (same family/tier + shared vocabulary) and serve the hardest
// near-misses, scaling difficulty with the player's mastery of the card.
import type { Family, Tier } from "../../data/schema";

const STOPWORDS = new Set([
  "the", "and", "for", "that", "with", "this", "from", "your", "their", "have",
  "has", "are", "was", "were", "will", "its", "into", "than", "then", "them",
  "they", "you", "our", "out", "not", "but", "can", "how", "who", "why", "what",
  "when", "which", "them", "there", "here", "just", "more", "most", "some",
  "such", "only", "over", "very", "much", "each", "these", "those", "about",
]);

export function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOPWORDS.has(w)),
  );
}

export function tokenOverlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n += 1;
  return n;
}

export interface DistractorCandidate {
  text: string;
  family: Family;
  tier: Tier;
}

// Higher score = harder to rule out. Same family is the strongest signal (the
// player already knows the family in a unit lesson, so a same-family wrong
// answer forces genuine discrimination); shared vocabulary adds surface
// plausibility.
export function confusability(
  target: { family: Family; tier: Tier; answerTokens: Set<string> },
  cand: DistractorCandidate,
): number {
  let score = 0;
  if (cand.family === target.family) score += 3;
  if (cand.tier === target.tier) score += 1;
  score += tokenOverlap(target.answerTokens, tokenize(cand.text)) * 2;
  return score;
}

function seededShuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Difficulty ramp keyed off the Leitner box (1 = brand new, 5 = mastered).
// New cards get fewer, gentler options; well-known cards get more options and
// the tightest near-misses so mastery is actually earned.
export function difficultyForBox(box: number): {
  distractorCount: number;
  hardness: number;
} {
  if (box <= 1) return { distractorCount: 3, hardness: 0.2 };
  if (box === 2) return { distractorCount: 3, hardness: 0.45 };
  if (box === 3) return { distractorCount: 4, hardness: 0.65 };
  if (box === 4) return { distractorCount: 4, hardness: 0.85 };
  return { distractorCount: 4, hardness: 1 };
}

/**
 * Pick `count` distractors ranked by confusability. `hardness` (0..1) controls
 * how tightly we draw from the top of the ranking: 1 = only the hardest
 * near-misses, 0 = a broad band so newer cards also see some easier options.
 */
export function selectDistractors(
  target: { family: Family; tier: Tier; correct: string },
  candidates: DistractorCandidate[],
  count: number,
  hardness: number,
  rand: () => number = Math.random,
): string[] {
  const answerTokens = tokenize(target.correct);

  // De-duplicate by text and drop the correct answer.
  const byText = new Map<string, DistractorCandidate>();
  for (const c of candidates) {
    if (!c.text || c.text === target.correct) continue;
    if (!byText.has(c.text)) byText.set(c.text, c);
  }

  const ranked = [...byText.values()]
    .map((c) => ({
      text: c.text,
      // small jitter so repeated encounters aren't identical
      score:
        confusability({ family: target.family, tier: target.tier, answerTokens }, c) +
        rand() * 0.5,
    }))
    .sort((a, b) => b.score - a.score);

  if (ranked.length <= count) return ranked.map((r) => r.text);

  // hardness=1 -> band is exactly the top `count` (hardest). hardness=0 -> band
  // spans the whole ranking (broad mix). Then shuffle within the band.
  const bandSize = Math.max(
    count,
    Math.round(count + (ranked.length - count) * (1 - hardness)),
  );
  const band = ranked.slice(0, Math.min(ranked.length, bandSize));
  return seededShuffle(band, rand)
    .slice(0, count)
    .map((r) => r.text);
}
