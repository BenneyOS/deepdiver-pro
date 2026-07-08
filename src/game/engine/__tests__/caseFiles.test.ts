import { describe, it, expect } from "vitest";
import seed from "../../../data/seed.json";
import type { Card, Family } from "../../../data/schema";
import { generateOptions } from "../session";
import {
  FEATURED_FAMILY,
  isUnitUnlocked,
  focusedUnitIndex,
  currentUnitIndex,
} from "../curriculum";

const cards = seed.cards as Card[];
const families = Object.keys(seed.families) as Family[];
const oTier1 = cards.filter((c) => c.family === "O" && c.tier === 1);
const oMotions = new Set(oTier1.map((c) => c.pattern));

describe("Case Files featured unit", () => {
  it("family O is always unlocked regardless of prior progress", () => {
    const idx = families.indexOf(FEATURED_FAMILY);
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(isUnitUnlocked(cards, families, idx, {})).toBe(true);
  });

  it("the featured unit is kept off the linear ladder (hero + current index)", () => {
    // With nothing played, the hero/current unit is the first real unit, not O.
    const oIdx = families.indexOf(FEATURED_FAMILY);
    expect(currentUnitIndex(cards, families, {})).not.toBe(oIdx);
    expect(focusedUnitIndex(cards, families, {})).not.toBe(oIdx);
  });
});

describe("Case Files Tier-1 distractors", () => {
  it("has enough distinct sibling motions to fill the options", () => {
    expect(oTier1.length).toBeGreaterThanOrEqual(4);
    expect(oMotions.size).toBeGreaterThanOrEqual(4);
  });

  it("every distractor is a sibling GTM motion on the first exposure (box 1)", () => {
    let rngSeed = 1;
    const rand = () => {
      rngSeed = (rngSeed * 1103515245 + 12345) & 0x7fffffff;
      return rngSeed / 0x7fffffff;
    };
    for (const card of oTier1) {
      const options = generateOptions(card, cards, { box: 1, rand });
      const distractors = options.filter((o) => !o.correct).map((o) => o.text);
      expect(distractors.length).toBeGreaterThanOrEqual(3);
      for (const d of distractors) {
        // Each wrong option must be another motion from the Case Files pool,
        // never a diagnostic sentence pulled from an unrelated family.
        expect(oMotions.has(d)).toBe(true);
        expect(d).not.toBe(card.pattern);
      }
    }
  });
});
