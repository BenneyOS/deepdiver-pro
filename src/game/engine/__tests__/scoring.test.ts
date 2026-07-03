import { describe, it, expect } from "vitest";
import {
  basePoints,
  wagerMultiplier,
  roundPoints,
  nextStreak,
  nextMomentum,
  rankFromAccuracy,
  gradeFromAccuracy,
} from "../scoring";

describe("basePoints", () => {
  it("returns 100 for tier 1", () => {
    expect(basePoints(1)).toBe(100);
  });
  it("returns 120 for tier 2", () => {
    expect(basePoints(2)).toBe(120);
  });
  it("returns 140 for tier 3", () => {
    expect(basePoints(3)).toBe(140);
  });
  it("returns 160 for tier 4", () => {
    expect(basePoints(4)).toBe(160);
  });
});

describe("wagerMultiplier", () => {
  it("returns 1 for hunch", () => {
    expect(wagerMultiplier("hunch")).toBe(1);
  });
  it("returns 2 for read-the-room", () => {
    expect(wagerMultiplier("read-the-room")).toBe(2);
  });
});

describe("roundPoints", () => {
  it("returns base * multiplier when correct", () => {
    expect(roundPoints(true, 1, "hunch")).toBe(100);
    expect(roundPoints(true, 1, "read-the-room")).toBe(200);
    expect(roundPoints(true, 4, "hunch")).toBe(160);
    expect(roundPoints(true, 4, "read-the-room")).toBe(320);
  });
  it("returns 0 when incorrect regardless of wager", () => {
    expect(roundPoints(false, 1, "hunch")).toBe(0);
    expect(roundPoints(false, 4, "read-the-room")).toBe(0);
  });
});

describe("nextStreak", () => {
  it("increments streak on correct", () => {
    expect(nextStreak(true, 0)).toBe(1);
    expect(nextStreak(true, 5)).toBe(6);
  });
  it("resets streak to 0 on incorrect", () => {
    expect(nextStreak(false, 0)).toBe(0);
    expect(nextStreak(false, 10)).toBe(0);
  });
});

describe("nextMomentum", () => {
  it("adds 12 * wagerMultiplier on correct", () => {
    expect(nextMomentum(true, "hunch", 50)).toBe(62);
    expect(nextMomentum(true, "read-the-room", 50)).toBe(74);
  });
  it("subtracts 14 on incorrect", () => {
    expect(nextMomentum(false, "hunch", 50)).toBe(36);
    expect(nextMomentum(false, "read-the-room", 50)).toBe(36);
  });
  it("clamps to 0 minimum", () => {
    expect(nextMomentum(false, "hunch", 5)).toBe(0);
    expect(nextMomentum(false, "hunch", 0)).toBe(0);
  });
  it("clamps to 100 maximum", () => {
    expect(nextMomentum(true, "read-the-room", 95)).toBe(100);
    expect(nextMomentum(true, "hunch", 99)).toBe(100);
  });
});

describe("rankFromAccuracy", () => {
  it("returns Prospect for 0%", () => {
    expect(rankFromAccuracy(0)).toBe("Prospect");
  });
  it("returns SDR for 35%", () => {
    expect(rankFromAccuracy(35)).toBe("SDR");
  });
  it("returns Account Exec for 55%", () => {
    expect(rankFromAccuracy(55)).toBe("Account Exec");
  });
  it("returns Senior Seller for 72%", () => {
    expect(rankFromAccuracy(72)).toBe("Senior Seller");
  });
  it("returns Diagnostic Closer for 88%", () => {
    expect(rankFromAccuracy(88)).toBe("Diagnostic Closer");
  });
  it("returns correct rank at boundaries", () => {
    expect(rankFromAccuracy(34)).toBe("Prospect");
    expect(rankFromAccuracy(54)).toBe("SDR");
    expect(rankFromAccuracy(71)).toBe("Account Exec");
    expect(rankFromAccuracy(87)).toBe("Senior Seller");
    expect(rankFromAccuracy(100)).toBe("Diagnostic Closer");
  });
});

describe("gradeFromAccuracy", () => {
  it("returns F for low accuracy", () => {
    expect(gradeFromAccuracy(0)).toBe("F");
    expect(gradeFromAccuracy(34)).toBe("F");
  });
  it("returns S for 95+", () => {
    expect(gradeFromAccuracy(95)).toBe("S");
    expect(gradeFromAccuracy(100)).toBe("S");
  });
  it("returns correct grades at thresholds", () => {
    expect(gradeFromAccuracy(35)).toBe("D");
    expect(gradeFromAccuracy(45)).toBe("C");
    expect(gradeFromAccuracy(55)).toBe("C+");
    expect(gradeFromAccuracy(64)).toBe("B");
    expect(gradeFromAccuracy(72)).toBe("B+");
    expect(gradeFromAccuracy(80)).toBe("A");
    expect(gradeFromAccuracy(88)).toBe("A+");
  });
});
