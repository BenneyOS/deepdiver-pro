import type { Card, CardProgress, Family } from "../../data/schema";

/**
 * The one coherent progress model.
 *
 * Every card has three linked states, all defined in terms of the same
 * correct-answer events written by every mode:
 *   - seen:     answered at least once (attempted)
 *   - cleared:  answered correctly at least once (permanent, per-card) — drives the path + unlock
 *   - mastered: reached the top Leitner box (box 5) — drives lifetime "X of N mastered"
 */

export const UNLOCK_THRESHOLD = 4;
export const MASTERY_BOX = 5;

export function isSeen(p: CardProgress | undefined): boolean {
  return (p?.seen ?? 0) > 0;
}

export function isCleared(p: CardProgress | undefined): boolean {
  return (p?.hit ?? 0) >= 1;
}

export function isMastered(p: CardProgress | undefined): boolean {
  return (p?.box ?? 0) >= MASTERY_BOX;
}

export function clearedInFamily(
  cards: Card[],
  progressMap: Map<string, CardProgress>,
  family: Family,
): number {
  return cards.filter(
    (c) => c.family === family && isCleared(progressMap.get(c.id)),
  ).length;
}

export function totalCleared(
  cards: Card[],
  progressMap: Map<string, CardProgress>,
): number {
  return cards.filter((c) => isCleared(progressMap.get(c.id))).length;
}

export function totalMastered(
  cards: Card[],
  progressMap: Map<string, CardProgress>,
): number {
  return cards.filter((c) => isMastered(progressMap.get(c.id))).length;
}

/** A family with fewer cards than the threshold unlocks when all its cards are cleared. */
export function unlockThresholdFor(familyTotal: number): number {
  return Math.min(UNLOCK_THRESHOLD, familyTotal);
}

export function isFamilyUnlocked(
  cards: Card[],
  progressMap: Map<string, CardProgress>,
  families: Family[],
  index: number,
): boolean {
  if (index <= 0) return true;
  const prev = families[index - 1];
  const prevTotal = cards.filter((c) => c.family === prev).length;
  return clearedInFamily(cards, progressMap, prev) >= unlockThresholdFor(prevTotal);
}
