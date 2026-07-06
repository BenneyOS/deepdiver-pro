const CORRECT_LINES = [
  "That's the read.",
  "Clean.",
  "Exactly the tell.",
  "You saw it.",
  "Sharp read.",
];

const CORRECT_WAGER_LINES = [
  "Called it \u2014 doubled.",
  "You were sure. Right to be.",
  "Confident and correct.",
];

const WRONG_LINES = [
  "Not quite. Here's the tell.",
  "Close \u2014 the sharper read was\u2026",
  "Almost. Look closer next time.",
];

const STREAK_LINES: Record<number, string> = {
  3: "Three straight. Warming up.",
  5: "Five straight. You're reading them cold \u2014 Senior Seller territory.",
  7: "Seven. You're not answering questions, you're architecting outcomes.",
  10: "Ten streak. This is who you are now.",
};

export function getAdaMicrocopy(
  correct: boolean,
  wager: "hunch" | "read-the-room",
  streak: number,
): string {
  if (streak > 0 && STREAK_LINES[streak]) {
    return STREAK_LINES[streak];
  }
  if (correct && wager === "read-the-room") {
    return CORRECT_WAGER_LINES[Math.floor(Math.random() * CORRECT_WAGER_LINES.length)];
  }
  if (correct) {
    return CORRECT_LINES[Math.floor(Math.random() * CORRECT_LINES.length)];
  }
  return WRONG_LINES[Math.floor(Math.random() * WRONG_LINES.length)];
}
