import type { Card, Family } from "../../data/schema";

/**
 * The curriculum layer (Proposal A + B).
 *
 * The path is now an explicit, human-scale ladder:
 *   - Each unit (family) is chunked into ordered LESSONS of `LESSON_SIZE` cards.
 *   - Playing a lesson to the end COMPLETES it (guaranteed advancement — this is
 *     the fix for "I played 19 times and nothing moved"). Accuracy earns 1–3
 *     stars, which you can improve by replaying.
 *   - A unit is MASTERED when all its lessons are complete (the gold state).
 *   - The next unit UNLOCKS early — as soon as you finish `UNLOCK_THRESHOLD`
 *     lessons of the current unit (default 3), so progress is never blocked on
 *     100%. Mastery is the optional completionist layer on top.
 *
 * Card-level Leitner progress (cleared / mastered) still runs underneath for
 * spaced repetition and the Pitch Portfolio, but the VISIBLE progression is
 * lessons — a number that moves every single session.
 */

export const LESSON_SIZE = 5;

/**
 * How many lessons of a unit you must finish before the NEXT unit unlocks.
 * Kept low and flat (not a percentage) so the sense of progress is fast and
 * predictable regardless of unit size. Units smaller than this unlock the next
 * one only when fully done (see `unitUnlockThreshold`).
 */
export const UNLOCK_THRESHOLD = 3;

/** Effective unlock threshold for a unit — never more than its lesson count. */
export function unitUnlockThreshold(unitTotal: number): number {
  return Math.min(UNLOCK_THRESHOLD, unitTotal);
}

/** Star rating for a single play of a lesson. Finishing always earns ≥ 1. */
export type Stars = 0 | 1 | 2 | 3;

export interface LessonRef {
  family: Family;
  index: number; // 0-based lesson number within the unit
  id: string; // stable id, e.g. "A-L0"
  cardIds: string[];
}

/** Persisted record of a completed lesson. */
export interface LessonRecord {
  stars: Stars;
  completedAt: string;
}

export type CompletedLessons = Record<string, LessonRecord>;

export function lessonId(family: Family, index: number): string {
  return `${family}-L${index}`;
}

/** Cards belonging to a family, in stable seed order. */
export function familyCards(cards: Card[], family: Family): Card[] {
  return cards.filter((c) => c.family === family);
}

/** Chunk a family's cards into ordered lessons of LESSON_SIZE. */
export function lessonsForFamily(cards: Card[], family: Family): LessonRef[] {
  const fam = familyCards(cards, family);
  const out: LessonRef[] = [];
  for (let i = 0; i * LESSON_SIZE < fam.length; i++) {
    const slice = fam.slice(i * LESSON_SIZE, i * LESSON_SIZE + LESSON_SIZE);
    out.push({
      family,
      index: i,
      id: lessonId(family, i),
      cardIds: slice.map((c) => c.id),
    });
  }
  return out;
}

/** Every lesson across every family, in path order. */
export function allLessons(cards: Card[], families: Family[]): LessonRef[] {
  return families.flatMap((f) => lessonsForFamily(cards, f));
}

export function totalLessonCount(cards: Card[], families: Family[]): number {
  return allLessons(cards, families).length;
}

/** Finishing a lesson always earns at least one star; accuracy raises it. */
export function starsForAccuracy(hits: number, total: number): Stars {
  if (total <= 0) return 0;
  const pct = hits / total;
  if (pct >= 1) return 3;
  if (pct >= 0.8) return 2;
  return 1;
}

export function isLessonComplete(
  completed: CompletedLessons,
  id: string,
): boolean {
  return Boolean(completed[id]);
}

export function lessonStars(completed: CompletedLessons, id: string): Stars {
  return completed[id]?.stars ?? 0;
}

export interface UnitState {
  family: Family;
  lessons: LessonRef[];
  total: number; // lessons in the unit
  done: number; // completed lessons
  stars: number; // total stars earned in the unit
  maxStars: number; // total*3
  complete: boolean; // MASTERED — every lesson done
  unlockThreshold: number; // lessons needed to unlock the NEXT unit
  clearedNext: boolean; // done >= unlockThreshold (next unit is unlocked)
  lessonsUntilUnlock: number; // remaining lessons before the next unit unlocks
}

export function unitState(
  cards: Card[],
  family: Family,
  completed: CompletedLessons,
): UnitState {
  const lessons = lessonsForFamily(cards, family);
  let done = 0;
  let stars = 0;
  for (const l of lessons) {
    if (isLessonComplete(completed, l.id)) {
      done += 1;
      stars += lessonStars(completed, l.id);
    }
  }
  const threshold = unitUnlockThreshold(lessons.length);
  return {
    family,
    lessons,
    total: lessons.length,
    done,
    stars,
    maxStars: lessons.length * 3,
    complete: lessons.length > 0 && done >= lessons.length,
    unlockThreshold: threshold,
    clearedNext: done >= threshold,
    lessonsUntilUnlock: Math.max(0, threshold - done),
  };
}

/**
 * A unit is unlocked when the previous unit has cleared its unlock threshold
 * (default: 3 lessons done) — NOT when it's fully mastered. This keeps players
 * moving forward without grinding an entire unit first.
 */
export function isUnitUnlocked(
  cards: Card[],
  families: Family[],
  index: number,
  completed: CompletedLessons,
): boolean {
  if (index <= 0) return true;
  return unitState(cards, families[index - 1], completed).clearedNext;
}

/** How many units are unlocked (playable) right now. */
export function unlockedUnitCount(
  cards: Card[],
  families: Family[],
  completed: CompletedLessons,
): number {
  let count = 0;
  for (let i = 0; i < families.length; i++) {
    if (isUnitUnlocked(cards, families, i, completed)) count += 1;
  }
  return count;
}

/** How many units are fully mastered (all lessons done). */
export function masteredUnitCount(
  cards: Card[],
  families: Family[],
  completed: CompletedLessons,
): number {
  let count = 0;
  for (const f of families) {
    if (unitState(cards, f, completed).complete) count += 1;
  }
  return count;
}

/** The first not-yet-complete lesson in a unit (what "Continue" plays). */
export function nextLessonInUnit(
  cards: Card[],
  family: Family,
  completed: CompletedLessons,
): LessonRef | null {
  const lessons = lessonsForFamily(cards, family);
  return lessons.find((l) => !isLessonComplete(completed, l.id)) ?? null;
}

/** Index of the current unit: first unlocked, not-yet-complete unit. */
export function currentUnitIndex(
  cards: Card[],
  families: Family[],
  completed: CompletedLessons,
): number {
  for (let i = 0; i < families.length; i++) {
    if (
      isUnitUnlocked(cards, families, i, completed) &&
      !unitState(cards, families[i], completed).complete
    ) {
      return i;
    }
  }
  return -1; // whole curriculum complete
}

/**
 * The unit the home screen's hero ring should focus on — it follows the player
 * DOWN the path instead of freezing on the first incomplete unit.
 *
 *  - Nothing played yet → the frontier (first unlocked, incomplete unit).
 *  - Otherwise → the DEEPEST unit with any progress. If that unit still has
 *    lessons left, stay on it. If it's fully mastered, advance to the next
 *    unlocked, not-yet-complete unit (so finishing a unit moves the hero forward
 *    rather than snapping back to an earlier, still-incomplete unit).
 */
export function focusedUnitIndex(
  cards: Card[],
  families: Family[],
  completed: CompletedLessons,
): number {
  let deepestEngaged = -1;
  for (let i = families.length - 1; i >= 0; i--) {
    if (unitState(cards, families[i], completed).done > 0) {
      deepestEngaged = i;
      break;
    }
  }
  if (deepestEngaged < 0) {
    return currentUnitIndex(cards, families, completed);
  }
  if (!unitState(cards, families[deepestEngaged], completed).complete) {
    return deepestEngaged;
  }
  // The deepest engaged unit is mastered — move forward to the next playable,
  // not-yet-complete unit so the hero tracks the new frontier.
  for (let i = deepestEngaged + 1; i < families.length; i++) {
    if (
      isUnitUnlocked(cards, families, i, completed) &&
      !unitState(cards, families[i], completed).complete
    ) {
      return i;
    }
  }
  // Nothing playable ahead (end of path or all ahead mastered): fall back to any
  // remaining incomplete unit, else keep showing the mastered deepest unit.
  const frontier = currentUnitIndex(cards, families, completed);
  return frontier >= 0 ? frontier : deepestEngaged;
}

/** The next lesson the player should do anywhere in the path. */
export function nextLessonOverall(
  cards: Card[],
  families: Family[],
  completed: CompletedLessons,
): LessonRef | null {
  const idx = currentUnitIndex(cards, families, completed);
  if (idx < 0) return null;
  return nextLessonInUnit(cards, families[idx], completed);
}

/** Look up a lesson by its id. */
export function findLesson(
  cards: Card[],
  families: Family[],
  id: string,
): LessonRef | null {
  return allLessons(cards, families).find((l) => l.id === id) ?? null;
}

export function completedLessonCount(completed: CompletedLessons): number {
  return Object.keys(completed).length;
}
