# M0 Test Plan — Read the Room

## What changed
Initial scaffold: React + Vite + TS + Tailwind app that loads `seed.json` (43 cards) and renders the first card (A1) as a static `ScenarioCard` with full diagnostic anatomy.

## What to test
One primary flow: app boots on mobile viewport, renders the correct card with all expected data from seed.json.

## Test 1: App boots and header renders correctly
**Steps:** Open `http://localhost:5173/` in a 390px-wide mobile viewport.
**Assertions:**
1. Title text is exactly "Read the Room"
2. Subtitle text is exactly "Diagnostic selling, one card at a time"
3. Stats line contains "43 scenarios", "8 families", "4 tiers"
4. Background color is dark (#0F1419 / var(--ink))

## Test 2: ScenarioCard renders card A1 with correct data
**Steps:** Scroll through the card on the same page.
**Assertions:**
1. Family badge text contains "Mainframe / COBOL core"
2. Tier badge text contains "T3" and "Choose the sharp question" (purple background)
3. Buyer quote contains "Our core banking system has been rock-solid for 30 years"
4. Pattern text contains "Mainframe legacy + key-person risk"

## Test 3: Diagnostic anatomy fields are all present and correct
**Steps:** Scroll to the diagnostic anatomy section of the card.
**Assertions:**
1. "Root Cause" label exists with value containing "Undocumented COBOL"
2. "Consequence" label exists with value containing "Blocks every modern initiative"
3. "Diagnostic" label exists with value containing "If the two people who understand it best left tomorrow"
4. "Angle" label exists with value containing "Agents read and document"
5. "Objection" label exists with value containing "You can't seriously let an AI touch our core ledger"
6. "Reframe" label exists with value containing "Agreed"

## Test 4: Persona shift chips render all four personas
**Steps:** Scroll to the persona shift section.
**Assertions:**
1. CTO chip exists with text "de-risks the modernization roadmap"
2. VPE chip exists with text "reduces risk on every change to the core"
3. CFO chip exists with text "cuts the cost of maintaining an opaque system"
4. CRO chip exists with text "reduces key-person and continuity risk"

## Test 5: Unit tests and content validation pass
**Steps:** Run `npm run test` and `npm run validate` in shell.
**Assertions:**
1. Vitest reports 6/6 tests passed, 0 failures
2. Content validator reports "Content OK: 43 cards, all fields valid"

## Test 6: Production build succeeds
**Steps:** Run `npm run build` in shell.
**Assertions:**
1. Build exits with code 0 (no TypeScript or bundler errors)
