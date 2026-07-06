import { describe, it, expect } from "vitest";
import {
  LESSON_SIZE,
  lessonId,
  lessonsForFamily,
  allLessons,
  totalLessonCount,
  starsForAccuracy,
  unitState,
  isUnitUnlocked,
  nextLessonInUnit,
  currentUnitIndex,
  nextLessonOverall,
  findLesson,
  completedLessonCount,
  type CompletedLessons,
} from "../curriculum";
import type { Card, Family } from "../../../data/schema";

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

// A=12 cards (3 lessons), B=5 cards (1 lesson), C=7 cards (2 lessons).
function deck(): Card[] {
  const cards: Card[] = [];
  for (let i = 0; i < 12; i++) cards.push(makeCard(`A${i}`, "A"));
  for (let i = 0; i < 5; i++) cards.push(makeCard(`B${i}`, "B"));
  for (let i = 0; i < 7; i++) cards.push(makeCard(`C${i}`, "C"));
  return cards;
}

const FAMILIES: Family[] = ["A", "B", "C"];

function complete(...ids: string[]): CompletedLessons {
  const out: CompletedLessons = {};
  for (const id of ids) out[id] = { stars: 3, completedAt: "2026-01-01" };
  return out;
}

describe("lesson chunking", () => {
  it("chunks a family into ordered lessons of LESSON_SIZE", () => {
    const cards = deck();
    const a = lessonsForFamily(cards, "A");
    expect(a.length).toBe(Math.ceil(12 / LESSON_SIZE)); // 3
    expect(a[0].cardIds).toEqual(["A0", "A1", "A2", "A3", "A4"]);
    expect(a[2].cardIds).toEqual(["A10", "A11"]); // last, partial
    expect(a[0].id).toBe(lessonId("A", 0));
  });

  it("a short family is a single lesson", () => {
    expect(lessonsForFamily(deck(), "B").length).toBe(1);
  });

  it("allLessons/totalLessonCount span every family in path order", () => {
    const cards = deck();
    expect(totalLessonCount(cards, FAMILIES)).toBe(3 + 1 + 2);
    expect(allLessons(cards, FAMILIES)[0].family).toBe("A");
  });
});

describe("stars", () => {
  it("finishing always earns at least one star", () => {
    expect(starsForAccuracy(0, 5)).toBe(1);
    expect(starsForAccuracy(3, 5)).toBe(1);
    expect(starsForAccuracy(4, 5)).toBe(2); // 80%
    expect(starsForAccuracy(5, 5)).toBe(3); // 100%
  });
  it("empty lesson earns zero", () => {
    expect(starsForAccuracy(0, 0)).toBe(0);
  });
});

describe("unit + unlock state", () => {
  it("unit is complete only when every lesson is done", () => {
    const cards = deck();
    const partial = complete("A-L0", "A-L1");
    expect(unitState(cards, "A", partial).complete).toBe(false);
    expect(unitState(cards, "A", partial).done).toBe(2);

    const full = complete("A-L0", "A-L1", "A-L2");
    expect(unitState(cards, "A", full).complete).toBe(true);
  });

  it("first unit is always unlocked; later units gate on the previous unit", () => {
    const cards = deck();
    expect(isUnitUnlocked(cards, FAMILIES, 0, {})).toBe(true);
    expect(isUnitUnlocked(cards, FAMILIES, 1, {})).toBe(false);

    const aDone = complete("A-L0", "A-L1", "A-L2");
    expect(isUnitUnlocked(cards, FAMILIES, 1, aDone)).toBe(true);
  });
});

describe("what to play next", () => {
  it("nextLessonInUnit returns the first incomplete lesson", () => {
    const cards = deck();
    expect(nextLessonInUnit(cards, "A", {})?.id).toBe("A-L0");
    expect(nextLessonInUnit(cards, "A", complete("A-L0"))?.id).toBe("A-L1");
    expect(nextLessonInUnit(cards, "A", complete("A-L0", "A-L1", "A-L2"))).toBeNull();
  });

  it("currentUnitIndex is the first unlocked, incomplete unit", () => {
    const cards = deck();
    expect(currentUnitIndex(cards, FAMILIES, {})).toBe(0);
    expect(currentUnitIndex(cards, FAMILIES, complete("A-L0", "A-L1", "A-L2"))).toBe(1);
  });

  it("nextLessonOverall walks the whole path and returns null when done", () => {
    const cards = deck();
    expect(nextLessonOverall(cards, FAMILIES, {})?.id).toBe("A-L0");
    const all = complete("A-L0", "A-L1", "A-L2", "B-L0", "C-L0", "C-L1");
    expect(currentUnitIndex(cards, FAMILIES, all)).toBe(-1);
    expect(nextLessonOverall(cards, FAMILIES, all)).toBeNull();
  });
});

describe("lookup helpers", () => {
  it("findLesson resolves a lesson by id", () => {
    const cards = deck();
    expect(findLesson(cards, FAMILIES, "C-L1")?.cardIds).toEqual(["C5", "C6"]);
    expect(findLesson(cards, FAMILIES, "Z-L9")).toBeNull();
  });
  it("completedLessonCount counts records", () => {
    expect(completedLessonCount(complete("A-L0", "B-L0"))).toBe(2);
  });
});
