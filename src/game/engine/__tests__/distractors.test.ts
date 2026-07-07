import { describe, it, expect } from "vitest";
import type { Family, Tier } from "../../../data/schema";
import {
  tokenize,
  tokenOverlap,
  confusability,
  difficultyForBox,
  selectDistractors,
  type DistractorCandidate,
} from "../distractors";

describe("tokenize", () => {
  it("drops short words and stopwords, keeps content words", () => {
    const t = tokenize("The legacy mainframe is at risk");
    expect(t.has("legacy")).toBe(true);
    expect(t.has("mainframe")).toBe(true);
    expect(t.has("risk")).toBe(true);
    expect(t.has("the")).toBe(false);
    expect(t.has("is")).toBe(false); // too short
  });
});

describe("tokenOverlap", () => {
  it("counts shared tokens", () => {
    expect(tokenOverlap(tokenize("legacy mainframe risk"), tokenize("mainframe risk debt"))).toBe(2);
  });
});

describe("confusability", () => {
  const target = {
    family: "A" as Family,
    tier: 1 as Tier,
    answerTokens: tokenize("stalled cloud migration mandate"),
  };
  it("scores same-family + shared-vocab higher than unrelated", () => {
    const sameFamily = confusability(target, {
      text: "stalled cloud mandate",
      family: "A",
      tier: 1,
    });
    const unrelated = confusability(target, {
      text: "vendor lock concerns",
      family: "F",
      tier: 3,
    });
    expect(sameFamily).toBeGreaterThan(unrelated);
  });
});

describe("difficultyForBox", () => {
  it("ramps option count and hardness with the Leitner box", () => {
    const easy = difficultyForBox(1);
    const mastered = difficultyForBox(5);
    expect(mastered.hardness).toBeGreaterThan(easy.hardness);
    expect(mastered.distractorCount).toBeGreaterThanOrEqual(easy.distractorCount);
    expect(mastered.hardness).toBe(1);
  });
});

describe("selectDistractors", () => {
  const candidates: DistractorCandidate[] = [
    { text: "stalled cloud mandate", family: "A", tier: 1 },
    { text: "cloud migration paralysis", family: "A", tier: 1 },
    { text: "unrelated vendor lock", family: "F", tier: 3 },
    { text: "budget freeze anxiety", family: "G", tier: 2 },
    { text: "another far-off pattern", family: "H", tier: 4 },
  ];
  const target = { family: "A" as Family, tier: 1 as Tier, correct: "stalled cloud migration" };

  it("never returns the correct answer and de-dupes", () => {
    const withDup = [...candidates, { text: "stalled cloud mandate", family: "A" as Family, tier: 1 as Tier }];
    const out = selectDistractors(target, withDup, 3, 1, () => 0.5);
    expect(out).not.toContain("stalled cloud migration");
    expect(new Set(out).size).toBe(out.length);
  });

  it("at max hardness favours the most confusable same-family near-misses", () => {
    const out = selectDistractors(target, candidates, 2, 1, () => 0.0);
    expect(out).toContain("stalled cloud mandate");
    expect(out).toContain("cloud migration paralysis");
  });

  it("returns at most `count` distractors", () => {
    const out = selectDistractors(target, candidates, 3, 0.5, () => 0.3);
    expect(out.length).toBeLessThanOrEqual(3);
  });
});
