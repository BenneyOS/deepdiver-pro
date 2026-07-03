import { describe, it, expect } from "vitest";
import {
  promote,
  demote,
  selectionWeight,
  nextDueAt,
  selectSessionQueue,
  updateProgress,
  INTERVAL_HOURS,
} from "../leitner";
import type { Card, CardProgress } from "../../../data/schema";

function makeCard(id: string, overrides?: Partial<Card>): Card {
  return {
    id,
    family: "A",
    tier: 1,
    prompt: "test",
    pattern: "test",
    rootCause: "test",
    consequence: "test",
    diagnostic: "test",
    angle: "test",
    objection: "test",
    reframe: "test",
    personaShift: { CTO: "t", VPE: "t", CFO: "t", CRO: "t" },
    version: 1,
    active: true,
    ...overrides,
  };
}

describe("promote", () => {
  it("increments box by 1", () => {
    expect(promote(1)).toBe(2);
    expect(promote(3)).toBe(4);
  });
  it("caps at 5", () => {
    expect(promote(5)).toBe(5);
    expect(promote(4)).toBe(5);
  });
});

describe("demote", () => {
  it("decrements box by 1", () => {
    expect(demote(3)).toBe(2);
    expect(demote(5)).toBe(4);
  });
  it("floors at 1", () => {
    expect(demote(1)).toBe(1);
    expect(demote(2)).toBe(1);
  });
});

describe("selectionWeight", () => {
  it("gives unseen cards higher weight (unseen bonus = 3)", () => {
    const card = makeCard("X1");
    const unseenWeight = selectionWeight(card, undefined);
    const seenWeight = selectionWeight(card, {
      cardId: "X1",
      box: 1,
      seen: 1,
      hit: 0,
    });
    expect(unseenWeight).toBeGreaterThan(seenWeight);
    expect(unseenWeight - seenWeight).toBe(3);
  });

  it("gives lower-box cards higher weight", () => {
    const card = makeCard("X1");
    const box1 = selectionWeight(card, {
      cardId: "X1",
      box: 1,
      seen: 1,
      hit: 0,
    });
    const box5 = selectionWeight(card, {
      cardId: "X1",
      box: 5,
      seen: 5,
      hit: 5,
    });
    expect(box1).toBeGreaterThan(box5);
  });

  it("is deterministic for the same card id", () => {
    const card = makeCard("A1");
    const w1 = selectionWeight(card, undefined);
    const w2 = selectionWeight(card, undefined);
    expect(w1).toBe(w2);
  });
});

describe("nextDueAt", () => {
  it("returns correct intervals per box", () => {
    const now = new Date("2024-01-01T00:00:00Z");
    for (const [box, hours] of Object.entries(INTERVAL_HOURS)) {
      const due = nextDueAt(Number(box), now);
      const diffMs = due.getTime() - now.getTime();
      expect(diffMs).toBe(hours * 60 * 60 * 1000);
    }
  });
});

describe("selectSessionQueue", () => {
  it("returns the requested number of cards", () => {
    const cards = Array.from({ length: 20 }, (_, i) => makeCard(`C${i}`));
    const result = selectSessionQueue(cards, new Map(), 7);
    expect(result).toHaveLength(7);
  });

  it("excludes inactive cards", () => {
    const cards = [
      makeCard("A1", { active: true }),
      makeCard("A2", { active: false }),
      makeCard("A3", { active: true }),
    ];
    const result = selectSessionQueue(cards, new Map(), 10);
    expect(result.map((c) => c.id)).not.toContain("A2");
  });

  it("prioritizes unseen cards", () => {
    const cards = [makeCard("SEEN"), makeCard("UNSEEN")];
    const progress = new Map<string, CardProgress>([
      ["SEEN", { cardId: "SEEN", box: 1, seen: 5, hit: 2 }],
    ]);
    const result = selectSessionQueue(cards, progress, 2);
    expect(result[0].id).toBe("UNSEEN");
  });

  it("returns fewer cards if pool is smaller than count", () => {
    const cards = [makeCard("A1"), makeCard("A2")];
    const result = selectSessionQueue(cards, new Map(), 7);
    expect(result).toHaveLength(2);
  });
});

describe("updateProgress", () => {
  const now = new Date("2024-06-15T12:00:00Z");

  it("creates new progress for unseen card on correct", () => {
    const result = updateProgress(undefined, "A1", true, now);
    expect(result.cardId).toBe("A1");
    expect(result.box).toBe(2);
    expect(result.seen).toBe(1);
    expect(result.hit).toBe(1);
    expect(result.lastAttemptAt).toBe(now.toISOString());
  });

  it("creates new progress for unseen card on incorrect", () => {
    const result = updateProgress(undefined, "A1", false, now);
    expect(result.box).toBe(1);
    expect(result.seen).toBe(1);
    expect(result.hit).toBe(0);
  });

  it("promotes box on correct", () => {
    const current: CardProgress = {
      cardId: "A1",
      box: 3,
      seen: 10,
      hit: 7,
    };
    const result = updateProgress(current, "A1", true, now);
    expect(result.box).toBe(4);
    expect(result.seen).toBe(11);
    expect(result.hit).toBe(8);
  });

  it("demotes box on incorrect", () => {
    const current: CardProgress = {
      cardId: "A1",
      box: 3,
      seen: 10,
      hit: 7,
    };
    const result = updateProgress(current, "A1", false, now);
    expect(result.box).toBe(2);
    expect(result.seen).toBe(11);
    expect(result.hit).toBe(7);
  });

  it("sets nextDueAt based on new box", () => {
    const result = updateProgress(undefined, "A1", true, now);
    const expectedDue = new Date(
      now.getTime() + INTERVAL_HOURS[2] * 60 * 60 * 1000,
    );
    expect(result.nextDueAt).toBe(expectedDue.toISOString());
  });
});
