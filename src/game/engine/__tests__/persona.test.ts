import { describe, it, expect } from "vitest";
import type { Card } from "../../../data/schema";
import { personaLens, allPersonaLenses } from "../persona";

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: "A1",
    family: "A",
    tier: 3,
    prompt: "p",
    pattern: "Mainframe legacy + key-person risk",
    rootCause: "r",
    consequence: "c",
    diagnostic: "d",
    angle: "a",
    objection: "o",
    reframe: "rf",
    soWhat: "sw",
    personaShift: {
      CTO: "De-risks the modernization roadmap.",
      VPE: "reduces risk on every change to the core",
      CFO: "cuts the cost of maintaining an opaque system",
      CRO: "reduces key-person and continuity risk",
    },
    version: 1,
    active: true,
    ...overrides,
  };
}

describe("personaLens", () => {
  it("gives each persona a distinct role title and priorities", () => {
    const lenses = allPersonaLenses(makeCard());
    expect(lenses).toHaveLength(4);
    const titles = lenses.map((l) => l.title);
    expect(new Set(titles).size).toBe(4); // all distinct
    const cares = lenses.map((l) => l.cares);
    expect(new Set(cares).size).toBe(4);
  });

  it("weaves the card's per-persona value phrase into why + say (normalised)", () => {
    const lens = personaLens(makeCard(), "CTO");
    // Trailing period stripped, lower-cased mid-sentence in 'why'.
    expect(lens.why).toContain("Chief Technology Officer");
    expect(lens.why).toContain("de-risks the modernization roadmap");
    expect(lens.why).not.toContain("roadmap..");
    // 'say' is a standalone, upper-cased quotable line.
    expect(lens.say.startsWith("De-risks the modernization roadmap")).toBe(true);
  });
});
