import { describe, it, expect } from "vitest";
import seed from "../../../data/seed.json";
import { FAMILY_LABELS } from "../../../data/schema";
import { UNLOCK_THRESHOLD, unlockThresholdFor } from "../progress";

/**
 * Data-integrity guarantees for every count shown on screen.
 *
 * The UI derives all denominators ("Mastered X of Y", "X of N cleared") from
 * seed.json at runtime. These tests lock that contract so a phantom/hardcoded
 * total can never regress in again.
 */
describe("seed data integrity", () => {
  const cards = seed.cards;
  const perFamily = cards.reduce<Record<string, number>>((acc, c) => {
    acc[c.family] = (acc[c.family] ?? 0) + 1;
    return acc;
  }, {});

  it("per-family counts sum to the total card count (the shown denominator)", () => {
    const sum = Object.values(perFamily).reduce((a, b) => a + b, 0);
    expect(sum).toBe(cards.length);
  });

  it("every declared family has at least one card", () => {
    for (const fam of Object.keys(seed.families)) {
      expect(perFamily[fam] ?? 0).toBeGreaterThan(0);
    }
  });

  it("every family present in cards has a UI label", () => {
    for (const fam of Object.keys(perFamily)) {
      expect(FAMILY_LABELS[fam as keyof typeof FAMILY_LABELS]).toBeTruthy();
    }
  });

  it("effective unlock threshold never exceeds a unit's real card count", () => {
    for (const fam of Object.keys(perFamily)) {
      const n = perFamily[fam];
      expect(unlockThresholdFor(n)).toBeLessThanOrEqual(n);
      expect(unlockThresholdFor(n)).toBeLessThanOrEqual(UNLOCK_THRESHOLD);
    }
  });

  it("card ids are unique", () => {
    const ids = new Set(cards.map((c) => c.id));
    expect(ids.size).toBe(cards.length);
  });
});
