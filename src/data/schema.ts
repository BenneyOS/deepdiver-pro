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

export const TIER_LABELS: Record<Tier, string> = {
  1: "Recognize the situation",
  2: "Name the root cause",
  3: "Choose the sharp question",
  4: "Handle the objection",
};
