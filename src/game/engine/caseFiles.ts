import type { Card } from "../../data/schema";
import { FEATURED_FAMILY, lessonsForFamily, type LessonRef } from "./curriculum";

/**
 * A single Case Files motion, assembled for the study-guide screen. Each lesson
 * in family O maps to exactly one GTM motion; its cards are the real customer
 * moments that won or expanded that deal.
 */
export interface CaseFileMotion {
  lessonId: string;
  index: number;
  /** The GTM motion (all cards in the lesson share it as their `pattern`). */
  motion: string;
  /** Named accounts featured in this motion, in first-appearance order. */
  customers: string[];
  cards: Card[];
}

function lessonCards(cards: Card[], lesson: LessonRef): Card[] {
  const byId = new Map(cards.map((c) => [c.id, c] as const));
  return lesson.cardIds
    .map((id) => byId.get(id))
    .filter((c): c is Card => Boolean(c));
}

/** Build the ordered list of Case Files motions for the study guide. */
export function caseFileMotions(cards: Card[]): CaseFileMotion[] {
  const lessons = lessonsForFamily(cards, FEATURED_FAMILY);
  return lessons.map((lesson) => {
    const group = lessonCards(cards, lesson);
    const motion =
      group[0]?.gtmMotion ?? group[0]?.pattern ?? `Lesson ${lesson.index + 1}`;
    const customers: string[] = [];
    for (const c of group) {
      if (c.customer && !customers.includes(c.customer)) customers.push(c.customer);
    }
    return {
      lessonId: lesson.id,
      index: lesson.index,
      motion,
      customers,
      cards: group,
    };
  });
}
