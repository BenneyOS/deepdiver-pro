// Deck metadata — labels for families, tiers, personas + version stamps.
// Card content lives in ./families/<A-H>.mjs and is compiled into seed.json
// by scripts/generate-seed.mjs. Bump contentVersion when content changes so
// clients refetch.
export const schemaVersion = 1;
export const contentVersion = 2;

export const families = {
  A: "Mainframe / COBOL core",
  B: "Framework version lag",
  C: "Language / platform migration",
  D: "Undocumented tribal knowledge",
  E: "Technical-debt drag",
  F: "Compliance-forced modernization",
  G: "Talent & hiring pressure",
  H: "Security & vulnerability exposure",
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
