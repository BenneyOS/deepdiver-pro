// Deck metadata — labels for families, tiers, personas + version stamps.
// Card content lives in ./families/<A-H>.mjs and is compiled into seed.json
// by scripts/generate-seed.mjs. Bump contentVersion when content changes so
// clients refetch.
export const schemaVersion = 1;
export const contentVersion = 5;

export const families = {
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

export const tiers = {
  1: "Recognize the situation",
  2: "Name the root cause",
  3: "Choose the sharp question",
  4: "Handle the objection",
};

export const personas = {
  CTO: "capability, architecture, strategic risk",
  VPE: "velocity, delivery, team morale",
  CFO: "cost, ROI, run-rate",
  CRO: "compliance, control, key-person risk",
};
