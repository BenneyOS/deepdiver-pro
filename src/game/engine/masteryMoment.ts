import type { Card } from "../../data/schema";

/**
 * Mastery Moment — the variable-reward upgrade over a bare "Correct".
 *
 * Not every correct answer gets one (that would make it predictable and flat).
 * It escalates on streak milestones and, otherwise, with a small random chance,
 * so the reward varies rather than repeating identically.
 */
export interface MasteryMoment {
  headline: string;
  nugget: string;
  flourish: boolean;
}

const HEADLINES = [
  "Winning read",
  "That's the pitch",
  "Architect's read",
  "Boss-buyer move",
];

export function shouldShowMasteryMoment(
  correct: boolean,
  streak: number,
  rand: () => number = Math.random,
): boolean {
  if (!correct) return false;
  // Guaranteed on streak milestones; otherwise a variable ~22% chance.
  if (streak === 3 || streak === 5 || streak >= 7) return true;
  return rand() < 0.22;
}

export function buildMasteryMoment(
  card: Card,
  streak: number,
  rand: () => number = Math.random,
): MasteryMoment {
  const flourish = streak >= 5;
  const headline = flourish
    ? "Boss-buyer move"
    : HEADLINES[Math.floor(rand() * HEADLINES.length)];
  return {
    headline,
    nugget: card.reframe,
    flourish,
  };
}

export function masteryShareText(card: Card): string {
  return `${card.pattern}\n\n"${card.reframe}"\n\n— a read I nailed in Read the Room`;
}
