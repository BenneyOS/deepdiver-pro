---
name: testing-home-lesson-flow
description: Test the Read the Room home screen and lesson progression end-to-end. Use when verifying home-screen progress UI (hero ring, path nodes, Continue CTA) or lesson completion / unlock behaviour.
---

# Testing the Read the Room home + lesson flow

## Run locally
- `npm install` then `npm run dev` — Vite dev server. It may pick port **5174** (or 5173) if another instance is running; check the terminal output for the actual URL.
- App is mobile-first; test at ~390px viewport (the layout is centered on desktop too, so full-window is fine for reading values).
- Checks before pushing: `npx tsc --noEmit`, `npm run lint` (oxlint), `npm run test` (vitest), `npm run build`.

## Reset to a fresh profile
Progress is stored in `localStorage`. To test from zero, run `localStorage.clear(); location.reload()` in the browser console once (this is a setup step, not a UI action). There is no in-app "reset progress" button.

## Home screen anatomy (what to assert)
The home screen intentionally shows ONE progress number, framed as **completed lesson count**, in three places that must always agree:
- Hero ring center: `N/total` + "lessons done"
- Current path node subtitle: `N of total lessons`
- Continue CTA subtext: `Next up · Lesson N+1` (an action label, deliberately has no denominator)

Other expectations:
- Path nodes show a **theme icon** per family (`FAMILY_ICONS` in `src/data/schema.ts`, e.g. A=🖥️, B=📦), NOT the letter. Completed nodes show a ✓, locked nodes a lock.
- Only the hero ring shows a progress arc — path node bubbles have no ring around them.
- The unlock milestone is shown in words ("N more lessons to unlock X"), not as a dot/notch on the ring.

## Play a lesson (to verify progression)
1. Tap **Continue**. A lesson is 5 rounds; formats vary (classic multiple-choice, "who's speaking", spot-the-weak-answer, sometimes a Hunch/Read-the-Room confidence wager).
2. Answer each round, then tap **Next Deal** to advance; after round 5 tap **View Scorecard**.
3. Scorecard should read "Lesson complete · Path advanced". Tap **Home**.
4. Verify all three counters advanced together (e.g. ring `0/10`→`1/10`, node `1 of 10 lessons`, CTA `Next up · Lesson 2`). If they disagree, that's the consistency bug regressing.
5. The next unit unlocks after **3 lessons** (early-unlock); mastery = all 10 lessons.

Lesson completion advances the path regardless of how many answers were correct (correctness affects stars/streak, not whether the lesson counts as done).

## Devin Secrets Needed
None — the game runs fully client-side with a bundled `seed.json`. No login or backend required for home/lesson testing.
