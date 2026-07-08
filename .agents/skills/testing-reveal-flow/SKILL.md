---
name: testing-reveal-flow
description: Test the Read-the-Room game's post-round Reveal screen and progression end-to-end on the live GitHub Pages build. Use when verifying reveal UX (the "so what" takeaway, progressive disclosure, persona lenses) or lesson/progress changes.
---

# Testing the Read the Room app

Live build: https://benneyos.github.io/deepdiver-pro/ (GitHub Pages, deploys automatically on merge to `main`).
Local dev: `npm run dev` → http://localhost:5173/. Content pipeline: `npm run generate` rebuilds `src/data/seed.json` from `content/`.
CI/quality gates: `npm run lint`, `npm run typecheck` (or `tsc`), `npm test`, `npm run build`, `npm run validate` (seed content guard).

## Verifying you're on the freshly-deployed build (not a stale cache)
The deploy job can finish before the CDN serves the new bundle. Confirm the live JS actually contains your change before testing:
```
base="https://benneyos.github.io/deepdiver-pro"
idx=$(curl -s "$base/"); js=$(echo "$idx" | grep -o 'assets/index-[A-Za-z0-9_-]*\.js' | head -1)
curl -s "$base/$js" | grep -o 'SOME_UNIQUE_STRING_FROM_YOUR_CHANGE'
```
If the string isn't there yet, wait and re-check — don't test a stale build. (This was a recurring source of "fix not working" confusion: always test the deployed main build, never a branch build, and never assume the deploy is live.)

**The app is a PWA with a precache service worker**, so a tab left open from a prior session can keep rendering the OLD bundle even after a new deploy. If the on-screen UI doesn't match the new bundle you confirmed via curl, bust the SW + caches, then hard-reload:
```js
// in the browser console
if (window.caches) for (const k of await caches.keys()) await caches.delete(k);
if (navigator.serviceWorker) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
```
Then Ctrl+Shift+R. Re-confirm by reading the DOM for a string unique to your change.

## Reaching a Reveal
Home → **Continue** (starts the next lesson) → pick an answer. Formats rotate:
- "sharpest diagnostic question" / "which pattern is playing out" → after selecting, a **wager** prompt appears (Hunch ×1 / Read the Room ×2); pick one to reach the reveal.
- "which is the weak answer to avoid" → selecting goes straight to the reveal (no wager). The correct pick is the over-confident/"just trust the AI" style option.

## Progressive disclosure (key behavior)
Driven by `localStorage.rtr_reveals_seen`, threshold `BREAKDOWN_FREE_PASSES=2` in `src/game/engine/disclosure.ts`.
- The "Full breakdown" section is **expanded by default on the player's first 2 reveals**, then **collapsed by default from the 3rd onward** (re-expandable on tap).
- To demonstrate the #1→#2→#3 transition deterministically, **reset state first** via the browser console (this is legit test setup, done before recording):
  ```js
  localStorage.clear();
  (await indexedDB.databases()).forEach(d => d.name && indexedDB.deleteDatabase(d.name));
  ```
  Then reload. Home should read `0/10 lessons done`.
- Read `aria-expanded` on the "Full breakdown" button to assert open/closed objectively rather than eyeballing.

## What "good" looks like on a reveal
- A bold **"THE SO WHAT"** block leads, with a card-specific principle (from `content/sowhat.mjs`) that is **distinct from the winning-option text** — not a restatement.
- The winning read appears **once** (the highlighted option with a "Winning read" badge). There should be **no** separate "THE WINNING READ" box reprinting the reframe.
- No Ada mascot in the reveal body. Personas are nested under a **"Same situation, four rooms"** toggle (CTO/VPE/CFO/CRO), each independently expandable.
- Some reveals also show a mastery-moment card ("Architect's read" + Share) — this is expected, not a duplicate.
- The expanded **"Full breakdown"** is intentionally lean: only **"Ask this"** (the diagnostic question) and **"Say it like this"** (the reframe), plus the nested personas toggle. Root cause / Consequence / Angle / "The pattern" were removed (#27) to cut cognitive load — their presence would be a regression.

## What "good" looks like on the Home screen (post-#27 trims)
- No **Pitch Portfolio** card (that feature is hidden until introduced).
- No **"Unit N of 14"** journey line under the Continue button.
- The unlock cue under the hero ring is the short **"🔓 N to unlock"** — not a long "N more lessons to unlock <Module name>" sentence.

## Recording tips
Maximize first: `sudo apt-get install -y wmctrl 2>/dev/null; wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`. Annotate each reveal (#1 open, #2 open, #3 collapsed, toggle re-expands) so the #2→#3 transition is easy to spot.

## Devin Secrets Needed
None — the app is a public static GitHub Pages site with client-side localStorage/IndexedDB state; no login or API keys required for reveal/progression testing.
