import { describe, it, expect } from "vitest";
import {
  isSeen,
  isCleared,
  isMastered,
  clearedInFamily,
  totalCleared,
  totalMastered,
  unlockThresholdFor,
  isFamilyUnlocked,
  UNLOCK_THRESHOLD,
} from "../progress";
import type { Card, CardProgress, Family } from "../../../data/schema";

function makeCard(id: string, family: Family): Card {
  return {
    id,
    family,
    tier: 1,
    prompt: "t",
    pattern: "t",
    rootCause: "t",
    consequence: "t",
    diagnostic: "t",
    angle: "t",
    objection: "t",
    reframe: "t",
    personaShift: { CTO: "t", VPE: "t", CFO: "t", CRO: "t" },
    version: 1,
    active: true,
  };
}

function progress(cardId: string, box: number, hit: number, seen = 1): CardProgress {
  return { cardId, box, seen, hit };
}

describe("state predicates", () => {
  it("isSeen: attempted at least once", () => {
    expect(isSeen(undefined)).toBe(false);
    expect(isSeen(progress("a", 1, 0, 0))).toBe(false);
    expect(isSeen(progress("a", 1, 0, 1))).toBe(true);
  });

  it("isCleared: answered correctly at least once (hit >= 1)", () => {
    expect(isCleared(undefined)).toBe(false);
    expect(isCleared(progress("a", 1, 0))).toBe(false);
    expect(isCleared(progress("a", 1, 1))).toBe(true);
    expect(isCleared(progress("a", 5, 9))).toBe(true);
  });

  it("isMastered: reached Leitner box 5", () => {
    expect(isMastered(undefined)).toBe(false);
    expect(isMastered(progress("a", 4, 4))).toBe(false);
    expect(isMastered(progress("a", 5, 5))).toBe(true);
  });
});

describe("family + totals", () => {
  const cards = [
    makeCard("A1", "A"),
    makeCard("A2", "A"),
    makeCard("B1", "B"),
  ];

  it("clearedInFamily counts only cleared cards in that family", () => {
    const map = new Map<string, CardProgress>([
      ["A1", progress("A1", 2, 1)],
      ["A2", progress("A2", 1, 0)],
      ["B1", progress("B1", 3, 2)],
    ]);
    expect(clearedInFamily(cards, map, "A")).toBe(1);
    expect(clearedInFamily(cards, map, "B")).toBe(1);
  });

  it("totalMastered counts only box-5 cards", () => {
    const map = new Map<string, CardProgress>([
      ["A1", progress("A1", 5, 6)],
      ["A2", progress("A2", 4, 4)],
      ["B1", progress("B1", 5, 7)],
    ]);
    expect(totalMastered(cards, map)).toBe(2);
    expect(totalCleared(cards, map)).toBe(3);
  });
});

describe("unlock rules", () => {
  it("threshold caps at family size for small families", () => {
    expect(unlockThresholdFor(6)).toBe(UNLOCK_THRESHOLD);
    expect(unlockThresholdFor(3)).toBe(3);
  });

  it("first family is always unlocked", () => {
    const cards = [makeCard("A1", "A")];
    expect(isFamilyUnlocked(cards, new Map(), ["A", "B"], 0)).toBe(true);
  });

  it("next family unlocks only when previous clears its threshold", () => {
    const families: Family[] = ["A", "B"];
    const cards = [
      makeCard("A1", "A"),
      makeCard("A2", "A"),
      makeCard("A3", "A"),
      makeCard("A4", "A"),
      makeCard("B1", "B"),
    ];
    const partial = new Map<string, CardProgress>([
      ["A1", progress("A1", 2, 1)],
      ["A2", progress("A2", 2, 1)],
      ["A3", progress("A3", 2, 1)],
    ]);
    expect(isFamilyUnlocked(cards, partial, families, 1)).toBe(false);

    const full = new Map(partial);
    full.set("A4", progress("A4", 2, 1));
    expect(isFamilyUnlocked(cards, full, families, 1)).toBe(true);
  });
});
