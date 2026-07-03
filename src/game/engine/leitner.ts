import type { Card, CardProgress } from "../../data/schema";

export function promote(box: number): number {
  return Math.min(5, box + 1);
}

export function demote(box: number): number {
  return Math.max(1, box - 1);
}

export function selectionWeight(
  card: Card,
  progress: CardProgress | undefined,
): number {
  const box = progress?.box ?? 1;
  const unseen = !progress?.seen;
  const jitter = pseudoRandom(card.id) * 1.5;
  return (6 - box) + (unseen ? 3 : 0) + jitter;
}

function pseudoRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 1000) / 1000;
}

export const INTERVAL_HOURS: Record<number, number> = {
  1: 1,
  2: 8,
  3: 24,
  4: 72,
  5: 168,
};

export function nextDueAt(box: number, now: Date = new Date()): Date {
  const hours = INTERVAL_HOURS[box] ?? 1;
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

export function selectSessionQueue(
  cards: Card[],
  progressMap: Map<string, CardProgress>,
  count: number,
): Card[] {
  const active = cards.filter((c) => c.active);
  const weighted = active.map((card) => ({
    card,
    weight: selectionWeight(card, progressMap.get(card.id)),
  }));
  weighted.sort((a, b) => b.weight - a.weight);
  return weighted.slice(0, count).map((w) => w.card);
}

export function selectBossDealsQueue(
  cards: Card[],
  progressMap: Map<string, CardProgress>,
  count: number,
): Card[] {
  const active = cards.filter((c) => c.active);
  const weighted = active.map((card) => {
    const baseWeight = selectionWeight(card, progressMap.get(card.id));
    const tierBonus = card.tier >= 3 ? 4 : 0;
    return { card, weight: baseWeight + tierBonus };
  });
  weighted.sort((a, b) => b.weight - a.weight);
  return weighted.slice(0, count).map((w) => w.card);
}

export function selectFamilyFocusQueue(
  cards: Card[],
  progressMap: Map<string, CardProgress>,
  family: string,
  count: number,
): Card[] {
  const familyCards = cards.filter((c) => c.active && c.family === family);
  const weighted = familyCards.map((card) => ({
    card,
    weight: selectionWeight(card, progressMap.get(card.id)),
  }));
  weighted.sort((a, b) => b.weight - a.weight);
  return weighted.slice(0, count).map((w) => w.card);
}

export function updateProgress(
  current: CardProgress | undefined,
  cardId: string,
  correct: boolean,
  now: Date = new Date(),
): CardProgress {
  const box = current?.box ?? 1;
  const newBox = correct ? promote(box) : demote(box);
  return {
    cardId,
    box: newBox,
    seen: (current?.seen ?? 0) + 1,
    hit: (current?.hit ?? 0) + (correct ? 1 : 0),
    nextDueAt: nextDueAt(newBox, now).toISOString(),
    lastAttemptAt: now.toISOString(),
  };
}
