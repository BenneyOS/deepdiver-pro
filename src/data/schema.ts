export type Family =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G"
  | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O";
export type Tier = 1 | 2 | 3 | 4;
export type Persona = "CTO" | "VPE" | "CFO" | "CRO";

export interface Card {
  id: string;
  family: Family;
  tier: Tier;
  prompt: string;
  pattern: string;
  rootCause: string;
  consequence: string;
  diagnostic: string;
  angle: string;
  objection: string;
  reframe: string;
  /** The transferable seller takeaway — the "so what" principle behind this
   * card, distinct from the buyer-facing reframe. Bespoke per card. */
  soWhat: string;
  personaShift: Record<Persona, string>;
  /** Case-study fields — present only on the "Case Files" unit (family O), where
   * each card is grounded in a real Devin customer. `gtmMotion` is the winning
   * go-to-market play, `customer` the named account, `proofMetric` the real
   * outcome the Reveal surfaces as a concrete proof point. */
  customer?: string;
  gtmMotion?: string;
  proofMetric?: string;
  version: number;
  active: boolean;
}

export interface Seed {
  schemaVersion: number;
  contentVersion: number;
  families: Record<Family, string>;
  tiers: Record<string, string>;
  personas: Record<Persona, string>;
  cards: Card[];
}

export interface CardProgress {
  cardId: string;
  box: number;
  seen: number;
  hit: number;
  nextDueAt?: string;
  lastAttemptAt?: string;
}

export const FAMILY_LABELS: Record<Family, string> = {
  A: "Mainframe / COBOL Core",
  B: "Framework Version Lag",
  C: "Language / Platform Migration",
  D: "Undocumented Tribal Knowledge",
  E: "Technical-Debt Drag",
  F: "Compliance-Forced Modernization",
  G: "Talent & Hiring Pressure",
  H: "Security & Vulnerability Exposure",
  I: "Cloud Cost & FinOps Pressure",
  J: "Data & Analytics Modernization",
  K: "AI/ML Adoption & Readiness",
  L: "Developer Experience & Tooling",
  M: "Integration & API Sprawl",
  N: "Observability & Reliability Gaps",
  O: "Case Files: Real Customer Wins",
};

// A distinct glyph per unit so the path reads as recognizable themes rather than
// opaque "A / B" letters.
export const FAMILY_ICONS: Record<Family, string> = {
  A: "\u{1F5A5}\uFE0F", // mainframe / desktop
  B: "\u{1F4E6}", // framework versions / package
  C: "\u{1F500}", // migration / shuffle
  D: "\u{1F4DC}", // tribal knowledge / scroll
  E: "\u2693", // tech-debt drag / anchor
  F: "\u2696\uFE0F", // compliance / scales
  G: "\u{1F465}", // talent & hiring / people
  H: "\u{1F6E1}\uFE0F", // security / shield
  I: "\u2601\uFE0F", // cloud cost / cloud
  J: "\u{1F4CA}", // data & analytics / bar chart
  K: "\u{1F916}", // AI/ML / robot
  L: "\u{1F9F0}", // developer experience / toolbox
  M: "\u{1F50C}", // integration & API / plug
  N: "\u{1F4E1}", // observability / satellite dish
  O: "\u{1F3C6}", // case files / real customer wins / trophy
};

export const TIER_LABELS: Record<Tier, string> = {
  1: "Recognize the situation",
  2: "Name the root cause",
  3: "Choose the sharp question",
  4: "Handle the objection",
};
