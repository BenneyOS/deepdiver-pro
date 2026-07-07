// Progressive disclosure for the answer reveal.
//
// The reveal's detailed breakdown (why it works, what to say, personas) has the
// same shape on every card, so after a couple of rounds it reads as repetitive
// noise. We keep the bespoke "so what" front-and-center on every reveal, but
// collapse the generic breakdown by default once the player has seen enough
// reveals to know the structure. They can always expand it.

const KEY = "rtr_reveals_seen";

// How many reveals show the breakdown expanded by default before it starts
// collapsing. Small on purpose — the structure is learned fast.
export const BREAKDOWN_FREE_PASSES = 2;

/** Whether the full breakdown should default to open given how many reveals the
 *  player had already seen BEFORE this one. Pure — safe to unit-test. */
export function breakdownDefaultOpen(seenBefore: number): boolean {
  return seenBefore < BREAKDOWN_FREE_PASSES;
}

export function getRevealsSeen(): number {
  try {
    const raw = localStorage.getItem(KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Increment the persisted reveal count and return the value BEFORE the bump
 *  (i.e. how many the player had seen prior to the current reveal). */
export function bumpRevealsSeen(): number {
  const before = getRevealsSeen();
  try {
    localStorage.setItem(KEY, String(before + 1));
  } catch {
    // storage unavailable; disclosure just won't persist across reloads
  }
  return before;
}
