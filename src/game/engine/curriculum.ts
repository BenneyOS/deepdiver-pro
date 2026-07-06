import type { Card, Family } from "../../data/schema";

/**
 * The curriculum layer (Proposal A + B).
 *
 * The path is now an explicit, human-scale ladder:
 *   - Each unit (family) is chunked into ordered LESSONS of `LESSON_SIZE` cards.
 *   - Playing a lesson to the end COMPLETES it (guaranteed advancement — this is
 *     the fix for "I played 19 times and nothing moved"). Accuracy earns 1–3
 *     stars, which you can improve by replaying.
 *   - A unit is complete when all its lessons are complete; the next unit
 *     unlocks when the previous unit is complete.
 *
 * Card-level Leitner progress (cleared / mastered) still runs underneath for
 * spaced repetition and the Pitch Portfolio, but the VISIBLE progression is
 * lessons — a number that moves every single session.
 */

export const LESSON_SIZE = 5;

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
  complete: boolean;
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
  return {
    family,
    lessons,
    total: lessons.length,
    done,
    stars,
    maxStars: lessons.length * 3,
    complete: lessons.length > 0 && done >= lessons.length,
  };
}

/** A unit is unlocked when the previous unit in the path is complete. */
export function isUnitUnlocked(
  cards: Card[],
  families: Family[],
  index: number,
  completed: CompletedLessons,
): boolean {
  if (index <= 0) return true;
  return unitState(cards, families[index - 1], completed).complete;
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
