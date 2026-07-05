// Compiles the human-authored card source (content/families/<A-H>.mjs) plus
// deck metadata (content/meta.mjs) into the two seed.json files the app and
// server consume:
//   - src/data/seed.json  (bundled into the client + used by unit tests)
//   - data/seed.json      (used by the content validator + server seeding)
//
// Each family file exports an ordered array of card bodies (no id/family/
// version/active). This generator assigns stable IDs (family letter + 1-based
// index, e.g. "E7"), stamps version/active, and keeps the two outputs in sync.
//
// Run: npm run generate  (also runs automatically as part of `npm run validate`
// is NOT assumed — run it whenever you edit content).
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  schemaVersion,
  contentVersion,
  families,
  tiers,
  personas,
} from "../content/meta.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

const FAMILIES = Object.keys(families);
const REQUIRED = [
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

const cards = [];
const problems = [];

for (const family of FAMILIES) {
  const mod = await import(`../content/families/${family}.mjs`);
  const list = mod.default;
  if (!Array.isArray(list)) {
    problems.push(`content/families/${family}.mjs must default-export an array`);
    continue;
  }
  list.forEach((body, i) => {
    const id = `${family}${i + 1}`;
    for (const f of REQUIRED) {
      const v = body[f];
      if (v === undefined || v === null || v === "") {
        problems.push(`${id} missing/empty field: ${f}`);
      }
    }
    if (body.personaShift) {
      for (const p of PERSONAS) {
        if (!body.personaShift[p]) problems.push(`${id} missing persona: ${p}`);
      }
    }
    if (![1, 2, 3, 4].includes(body.tier)) {
      problems.push(`${id} bad tier: ${body.tier}`);
    }
    cards.push({ id, family, ...body, version: 1, active: true });
  });
}

if (problems.length) {
  console.error(`generate-seed FAILED (${problems.length} issues):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

const seed = {
  schemaVersion,
  contentVersion,
  families,
  tiers: Object.fromEntries(Object.entries(tiers)),
  personas,
  cards,
};

const json = JSON.stringify(seed, null, 2) + "\n";
for (const out of ["src/data/seed.json", "data/seed.json"]) {
  writeFileSync(resolve(root, out), json);
}

const byFamily = Object.fromEntries(
  FAMILIES.map((f) => [f, cards.filter((c) => c.family === f).length]),
);
const byTier = Object.fromEntries(
  [1, 2, 3, 4].map((t) => [t, cards.filter((c) => c.tier === t).length]),
);
console.log(`Generated ${cards.length} cards -> src/data/seed.json, data/seed.json`);
console.log(`  per family: ${JSON.stringify(byFamily)}`);
console.log(`  per tier:   ${JSON.stringify(byTier)}`);
