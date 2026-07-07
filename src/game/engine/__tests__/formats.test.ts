import { describe, it, expect } from "vitest";
import type { Card } from "../../../data/schema";
import {
  buildWhosSpeaking,
  buildSpotWeak,
  rotateFormats,
  formatPoolForMode,
  WEAK_REFRAMES,
  type ExerciseFormat,
} from "../formats";

function makeCard(id: string, overrides: Partial<Card> = {}): Card {
  return {
    id,
    family: "A",
    tier: 1,
    prompt: `prompt ${id}`,
    pattern: `pattern ${id}`,
    rootCause: `root ${id}`,
    consequence: `cons ${id}`,
    diagnostic: `diag ${id}`,
    angle: `angle ${id}`,
    objection: `obj ${id}`,
    reframe: `First part. Second part — third part, fourth part.`,
    personaShift: {
      CTO: `cto ${id}`,
      VPE: `vpe ${id}`,
      CFO: `cfo ${id}`,
      CRO: `cro ${id}`,
    },
    version: 1,
    active: true,
    ...overrides,
  };
}

// Deterministic RNG for reproducible assertions.
function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("buildWhosSpeaking", () => {
  it("produces exactly one correct persona option matching the shown line", () => {
    const card = makeCard("A1");
    const r = buildWhosSpeaking(card, seq([0]));
    const correct = r.options.filter((o) => o.correct);
    expect(correct).toHaveLength(1);
    expect(r.options).toHaveLength(4);
    expect(card.personaShift[r.correctPersona]).toBe(r.line);
    expect(correct[0].text).toBe(r.correctPersona);
  });
});

describe("buildSpotWeak", () => {
  it("flags exactly one weak option, drawn from the weak pool", () => {
    const all = [
      makeCard("A1", { reframe: "Reframe one is genuinely strong." }),
      makeCard("A2", { reframe: "Reframe two is also strong." }),
      makeCard("A3", { reframe: "Reframe three holds up well." }),
      makeCard("A4", { reframe: "Reframe four is solid too." }),
    ];
    const r = buildSpotWeak(all[0], all, Math.random);
    const correct = r.options.filter((o) => o.correct);
    expect(r.options).toHaveLength(4);
    expect(correct).toHaveLength(1);
    expect(WEAK_REFRAMES).toContain(correct[0].text);
  });
});

describe("rotateFormats", () => {
  it("never serves the same format more than twice in a row", () => {
    const pool: ExerciseFormat[] = ["classic", "whos-speaking", "spot-weak"];
    const seqOut = rotateFormats(200, pool, Math.random);
    for (let i = 2; i < seqOut.length; i++) {
      const threeSame = seqOut[i] === seqOut[i - 1] && seqOut[i] === seqOut[i - 2];
      expect(threeSame).toBe(false);
    }
  });

  it("returns the requested count", () => {
    expect(rotateFormats(7, ["classic"], Math.random)).toHaveLength(7);
  });
});

describe("formatPoolForMode", () => {
  it("quick-drill mixes the per-card formats", () => {
    expect(formatPoolForMode("quick-drill").sort()).toEqual(
      ["classic", "spot-weak", "whos-speaking"].sort(),
    );
  });

  it("boss-deals uses judgment-heavy formats", () => {
    expect(formatPoolForMode("boss-deals")).toContain("spot-weak");
  });

  it("family-focus uses review formats", () => {
    expect(formatPoolForMode("family-focus")).toContain("whos-speaking");
  });

  it("no pool includes the removed build-reframe format", () => {
    for (const mode of ["quick-drill", "boss-deals", "family-focus"]) {
      expect(formatPoolForMode(mode)).not.toContain("build-reframe");
    }
  });
});
