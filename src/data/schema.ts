export type Family =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G"
  | "H" | "I" | "J" | "K" | "L" | "M" | "N";
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
  personaShift: Record<Persona, string>;
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
  A: "Mainframe / COBOL core",
  B: "Framework version lag",
  C: "Language / platform migration",
  D: "Undocumented tribal knowledge",
  E: "Technical-debt drag",
  F: "Compliance-forced modernization",
  G: "Talent & hiring pressure",
  H: "Security & vulnerability exposure",
  I: "Cloud cost & FinOps pressure",
  J: "Data & analytics modernization",
  K: "AI/ML adoption & readiness",
  L: "Developer experience & tooling",
  M: "Integration & API sprawl",
  N: "Observability & reliability gaps",
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
};

export const TIER_LABELS: Record<Tier, string> = {
  1: "Recognize the situation",
  2: "Name the root cause",
  3: "Choose the sharp question",
  4: "Handle the objection",
};
