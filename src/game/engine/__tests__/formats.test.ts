import { describe, it, expect } from "vitest";
import type { Card } from "../../../data/schema";
import {
  buildWhosSpeaking,
  buildSpotWeak,
  rotateFormats,
  formatPoolForMode,
  WEAK_REFRAMES,
  pickWeakReframe,
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
    soWhat: `so what ${id}`,
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

  it("picks weak lines with variety and avoids recently-shown ones", () => {
    // Over many random picks we should see a broad spread, not one line.
    const seen = new Set(
      Array.from({ length: 200 }, () => pickWeakReframe(Math.random)),
    );
    expect(seen.size).toBeGreaterThanOrEqual(8);

    // Recency: a line in the recent list is never re-picked while alternatives
    // remain, so consecutive spot-weak rounds don't repeat the same weak line.
    const recent = WEAK_REFRAMES.slice(0, WEAK_REFRAMES.length - 1);
    for (let i = 0; i < 50; i++) {
      expect(recent).not.toContain(pickWeakReframe(Math.random, recent));
    }
  });
});

describe("rotateFormats", () => {
  it("never serves the same format twice in a row", () => {
    const pool: ExerciseFormat[] = ["classic", "whos-speaking", "spot-weak"];
    const seqOut = rotateFormats(200, pool, Math.random);
    for (let i = 1; i < seqOut.length; i++) {
      expect(seqOut[i] === seqOut[i - 1]).toBe(false);
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
