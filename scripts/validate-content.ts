import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const TIERS = [1, 2, 3, 4];
const REQUIRED = [
  "id",
  "family",
  "tier",
  "prompt",
  "pattern",
  "rootCause",
  "consequence",
  "diagnostic",
  "angle",
  "objection",
  "reframe",
  "personaShift",
];
const PERSONAS = ["CTO", "VPE", "CFO", "CRO"];

const seedPath = resolve(import.meta.dirname, "..", "data", "seed.json");
const seed = JSON.parse(readFileSync(seedPath, "utf-8"));
const FAMILIES = Object.keys(seed.families);

const errors: string[] = [];
const ids = new Set<string>();

for (const c of seed.cards) {
  for (const f of REQUIRED) {
    if (
      (c as Record<string, unknown>)[f] === undefined ||
      (c as Record<string, unknown>)[f] === null ||
      (c as Record<string, unknown>)[f] === ""
    ) {
      errors.push(`Card ${c.id ?? "?"} missing field: ${f}`);
    }
  }
  if (!FAMILIES.includes(c.family))
    errors.push(`Card ${c.id} bad family: ${c.family}`);
  if (!TIERS.includes(c.tier))
    errors.push(`Card ${c.id} bad tier: ${c.tier}`);
  if (ids.has(c.id)) errors.push(`Duplicate id: ${c.id}`);
  ids.add(c.id);
  if (c.personaShift) {
    for (const p of PERSONAS) {
      if (!(c.personaShift as Record<string, unknown>)[p])
        errors.push(`Card ${c.id} missing persona: ${p}`);
    }
  }
}

// Data-integrity: per-family counts must sum to the total card count.
// This is the denominator shown on screen ("Mastered X of Y", "X of N cleared"),
// so a mismatch here means the UI would display a phantom total.
const perFamily: Record<string, number> = {};
for (const c of seed.cards) {
  perFamily[c.family] = (perFamily[c.family] ?? 0) + 1;
}
const familySum = Object.values(perFamily).reduce((a, b) => a + b, 0);
if (familySum !== seed.cards.length) {
  errors.push(
    `Per-family counts sum to ${familySum} but total cards is ${seed.cards.length}`,
  );
}

// Every declared family must have at least one card, and the unlock threshold
// (4) must never exceed the smallest family — otherwise a unit can never unlock.
const UNLOCK_THRESHOLD = 4;
for (const f of FAMILIES) {
  const n = perFamily[f] ?? 0;
  if (n === 0) errors.push(`Family ${f} declared but has 0 cards`);
}

if (errors.length) {
  console.error(`Content validation FAILED (${errors.length} issues):`);
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  const smallest = Math.min(...Object.values(perFamily));
  const counts = FAMILIES.map((f) => `${f}=${perFamily[f]}`).join(" ");
  console.log(
    `Content OK: ${seed.cards.length} cards across ${FAMILIES.length} families (${counts}).`,
  );
  console.log(
    `Effective unlock threshold per unit = min(${UNLOCK_THRESHOLD}, family size); smallest family = ${smallest}.`,
  );
}
