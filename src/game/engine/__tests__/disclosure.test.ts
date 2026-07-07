import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  BREAKDOWN_FREE_PASSES,
  breakdownDefaultOpen,
  getRevealsSeen,
  bumpRevealsSeen,
} from "../disclosure";

describe("breakdownDefaultOpen", () => {
  it("opens by default for the first few reveals, then collapses", () => {
    for (let seen = 0; seen < BREAKDOWN_FREE_PASSES; seen++) {
      expect(breakdownDefaultOpen(seen)).toBe(true);
    }
    expect(breakdownDefaultOpen(BREAKDOWN_FREE_PASSES)).toBe(false);
    expect(breakdownDefaultOpen(BREAKDOWN_FREE_PASSES + 5)).toBe(false);
  });
});

describe("reveals-seen counter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts at zero", () => {
    expect(getRevealsSeen()).toBe(0);
  });

  it("bump returns the count before incrementing and persists the new value", () => {
    expect(bumpRevealsSeen()).toBe(0);
    expect(getRevealsSeen()).toBe(1);
    expect(bumpRevealsSeen()).toBe(1);
    expect(getRevealsSeen()).toBe(2);
  });

  it("tolerates corrupt storage values", () => {
    localStorage.setItem("rtr_reveals_seen", "not-a-number");
    expect(getRevealsSeen()).toBe(0);
  });

  it("survives storage throwing (private mode / disabled)", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getRevealsSeen()).toBe(0);
    spy.mockRestore();
  });
});
