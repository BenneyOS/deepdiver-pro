import { describe, it, expect } from "vitest";
import seedData from "../seed.json";

const FAMILIES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const TIERS = [1, 2, 3, 4];
const REQUIRED_FIELDS = [
  "id",
  "family",
  "tier",
  "prompt",
  "pattern",
  "rootCause",
  "consequence",
  "diagnostic",
  "angle",
  "objection",
  "reframe",
  "personaShift",
] as const;
const PERSONAS = ["CTO", "VPE", "CFO", "CRO"] as const;

const seed = seedData as { cards: Record<string, unknown>[] };

describe("seed.json content validation", () => {
  it("has at least one card", () => {
    expect(seed.cards.length).toBeGreaterThan(0);
  });

  it("every card has all required fields populated", () => {
    for (const card of seed.cards) {
      for (const field of REQUIRED_FIELDS) {
        expect(
          card[field],
          `Card ${card.id ?? "?"} missing field: ${field}`
        ).toBeDefined();
        expect(
          card[field],
          `Card ${card.id ?? "?"} has empty field: ${field}`
        ).not.toBe("");
      }
    }
  });

  it("every card has a valid family (A-H)", () => {
    for (const card of seed.cards) {
      expect(
        FAMILIES,
        `Card ${card.id} has invalid family: ${card.family}`
      ).toContain(card.family);
    }
  });

  it("every card has a valid tier (1-4)", () => {
    for (const card of seed.cards) {
      expect(
        TIERS,
        `Card ${card.id} has invalid tier: ${card.tier}`
      ).toContain(card.tier);
    }
  });

  it("no duplicate IDs", () => {
    const ids = seed.cards.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("every card has all four persona shifts", () => {
    for (const card of seed.cards) {
      const shifts = card.personaShift as Record<string, unknown> | undefined;
      expect(shifts, `Card ${card.id} missing personaShift`).toBeDefined();
      if (shifts) {
        for (const persona of PERSONAS) {
          expect(
            shifts[persona],
            `Card ${card.id} missing persona: ${persona}`
          ).toBeTruthy();
        }
      }
    }
  });
});
