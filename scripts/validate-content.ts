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

if (errors.length) {
  console.error(`Content validation FAILED (${errors.length} issues):`);
  for (const e of errors) {
    console.error(`  - ${e}`);
  }
  process.exit(1);
} else {
  console.log(`Content OK: ${seed.cards.length} cards, all fields valid.`);
}
