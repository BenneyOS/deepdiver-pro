import { describe, it, expect } from "vitest";
import type { Card } from "../../../data/schema";
import {
  shouldShowMasteryMoment,
  buildMasteryMoment,
  masteryShareText,
} from "../masteryMoment";

function makeCard(): Card {
  return {
    id: "X-1",
    family: "A",
    tier: 1,
    prompt: "p",
    pattern: "The pattern",
    rootCause: "r",
    consequence: "c",
    diagnostic: "d",
    angle: "a",
    objection: "o",
    reframe: "The winning reframe.",
    personaShift: { CTO: "t", VPE: "t", CFO: "t", CRO: "t" },
    version: 1,
    active: true,
  };
}

describe("masteryMoment", () => {
  it("never shows on a wrong answer", () => {
    expect(shouldShowMasteryMoment(false, 3)).toBe(false);
    expect(shouldShowMasteryMoment(false, 10, () => 0)).toBe(false);
  });

  it("always shows on streak milestones", () => {
    expect(shouldShowMasteryMoment(true, 3, () => 0.99)).toBe(true);
    expect(shouldShowMasteryMoment(true, 5, () => 0.99)).toBe(true);
    expect(shouldShowMasteryMoment(true, 8, () => 0.99)).toBe(true);
  });

  it("is variable off-milestone (chance-based)", () => {
    expect(shouldShowMasteryMoment(true, 2, () => 0.1)).toBe(true);
    expect(shouldShowMasteryMoment(true, 2, () => 0.9)).toBe(false);
  });

  it("escalates with a flourish at high streaks", () => {
    const card = makeCard();
    expect(buildMasteryMoment(card, 6, () => 0).flourish).toBe(true);
    expect(buildMasteryMoment(card, 2, () => 0).flourish).toBe(false);
  });

  it("uses the card reframe as the nugget and pattern in share text", () => {
    const card = makeCard();
    const m = buildMasteryMoment(card, 2, () => 0);
    expect(m.nugget).toBe(card.reframe);
    expect(masteryShareText(card)).toContain(card.pattern);
    expect(masteryShareText(card)).toContain(card.reframe);
  });
});
