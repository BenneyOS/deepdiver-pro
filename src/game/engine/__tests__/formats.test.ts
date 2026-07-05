import { describe, it, expect } from "vitest";
import type { Card } from "../../../data/schema";
import {
  buildWhosSpeaking,
  buildSpotWeak,
  buildReframeAssembly,
  tokenizeReframe,
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

describe("tokenizeReframe", () => {
  it("splits on sentence and clause boundaries", () => {
    expect(tokenizeReframe("First part. Second part — third part, fourth part.")).toEqual([
      "First part.",
      "Second part",
      "third part",
      "fourth part.",
    ]);
  });
});

describe("buildReframeAssembly", () => {
  it("preserves the correct order and adds distractors from other cards", () => {
    const target = makeCard("A1");
    const others = [makeCard("A2", { reframe: "Alien clause one. Alien clause two." })];
    const r = buildReframeAssembly(target, [target, ...others], Math.random);
    expect(r.correctOrder).toEqual(tokenizeReframe(target.reframe));
    // shuffled contains all real fragments plus at least one distractor
    const realCount = r.shuffled.filter((t) => !t.isDistractor).length;
    expect(realCount).toBe(r.correctOrder.length);
    expect(r.shuffled.some((t) => t.isDistractor)).toBe(true);
  });
});

describe("rotateFormats", () => {
  it("never serves the same format more than twice in a row", () => {
    const pool: ExerciseFormat[] = ["classic", "whos-speaking", "spot-weak", "build-reframe"];
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
  it("quick-drill mixes all four per-card formats", () => {
    expect(formatPoolForMode("quick-drill").sort()).toEqual(
      ["build-reframe", "classic", "spot-weak", "whos-speaking"].sort(),
    );
  });

  it("boss-deals uses judgment-heavy formats", () => {
    expect(formatPoolForMode("boss-deals")).toContain("spot-weak");
  });

  it("family-focus uses review formats", () => {
    expect(formatPoolForMode("family-focus")).toContain("build-reframe");
  });
});
