import type { Tier } from "../../data/schema";

export type Wager = "hunch" | "read-the-room";

export type Rank =
  | "Prospect"
  | "SDR"
  | "Account Exec"
  | "Senior Seller"
  | "Diagnostic Closer";

export interface RoundResult {
  correct: boolean;
  tier: Tier;
  wager: Wager;
  points: number;
}

export function basePoints(tier: Tier): number {
  return 100 + (tier - 1) * 20;
}

export function wagerMultiplier(wager: Wager): number {
  return wager === "hunch" ? 1 : 2;
}

export function roundPoints(correct: boolean, tier: Tier, wager: Wager): number {
  return correct ? basePoints(tier) * wagerMultiplier(wager) : 0;
}

export function nextStreak(correct: boolean, currentStreak: number): number {
  return correct ? currentStreak + 1 : 0;
}

export function nextMomentum(
  correct: boolean,
  wager: Wager,
  currentMomentum: number,
): number {
  const wagerMult = wagerMultiplier(wager);
  const delta = correct ? 12 * wagerMult : -14;
  return Math.max(0, Math.min(100, currentMomentum + delta));
}

const RANK_THRESHOLDS: [number, Rank][] = [
  [88, "Diagnostic Closer"],
  [72, "Senior Seller"],
  [55, "Account Exec"],
  [35, "SDR"],
  [0, "Prospect"],
];

export function rankFromAccuracy(accuracyPct: number): Rank {
  for (const [threshold, rank] of RANK_THRESHOLDS) {
    if (accuracyPct >= threshold) return rank;
  }
  return "Prospect";
}

const GRADE_THRESHOLDS: [number, string][] = [
  [95, "S"],
  [88, "A+"],
  [80, "A"],
  [72, "B+"],
  [64, "B"],
  [55, "C+"],
  [45, "C"],
  [35, "D"],
  [0, "F"],
];

export function gradeFromAccuracy(accuracyPct: number): string {
  for (const [threshold, grade] of GRADE_THRESHOLDS) {
    if (accuracyPct >= threshold) return grade;
  }
  return "F";
}
