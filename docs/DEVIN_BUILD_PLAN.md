# Devin Build Plan — Read the Room

How to direct Devin to build this. Each task is **bounded, testable, and sequenced**. Give Devin one milestone at a time; verify the artifact (passing tests / working preview) before advancing. This mirrors how you'd run a real modernization pilot: incremental, verifiable, human-approved at each PR.

---

## How to work with Devin on this

1. **Point Devin at the repo** containing this `/docs` folder and `/data/seed.json`.
2. **Feed it one milestone prompt at a time** (below). Let it plan, execute, run tests, and open a PR.
3. **Review each PR** against the acceptance criteria. Approve, then advance.
4. **Never skip the tests** on `leitner.ts` and `scoring.ts` — they are the correctness core.

---

## Milestone M0 — Skeleton & data

**Prompt to Devin:**
> Initialize a React + Vite + TypeScript project with Tailwind. Add Zustand. Create the type definitions in `src/data/schema.ts` matching `/data/seed.json`. Load `seed.json` and render a single static scenario card (prompt + options) with no interactivity yet. Add a CI script `scripts/validate-content.ts` that asserts every card in seed.json has all required fields, a valid family (A–H) and tier (1–4), and no duplicate IDs. Set up Vitest and make the content-validation test pass.

**Acceptance:** app boots on mobile viewport; one card renders; `npm run validate` passes; content test green.

---

## Milestone M1 — Core game loop (local only)

**Prompt to Devin:**
> Implement the round flow: player selects an answer, then a confidence wager (Hunch ×1 / Read-the-room ×2), then resolve and reveal the full diagnostic anatomy (root cause, consequence, diagnostic, angle, objection+reframe, and the four persona-shift chips). Implement `src/game/engine/scoring.ts` and `src/game/engine/leitner.ts` exactly per the contracts in ARCHITECTURE.md, each with exhaustive Vitest unit tests. Wire a Quick Drill session of 7 cards selected by Leitner weighting. Add the HUD (deal count, streak, points) and the Momentum meter. State lives in Zustand. No backend yet — persist Leitner boxes to IndexedDB.

**Acceptance:** a full 7-card session plays end to end on mobile; scoring/streak/momentum behave per contract; leitner + scoring unit tests pass; progress survives a page reload (IndexedDB).

---

## Milestone M2 — Backend & sync

**Prompt to Devin:**
> Build the Fastify + TypeScript backend with Prisma + PostgreSQL using the schema in ARCHITECTURE.md. Implement magic-link auth (request + verify → JWT). Implement `GET /cards`, `GET /progress`, `PATCH /progress` (batch deltas, reconciling by max box + latest timestamp), and `POST /sessions`. On the client, add `src/sync/` with an optimistic sync queue that flushes Leitner deltas when online and authed, and merges server state on login. Add integration tests for the progress reconciliation logic.

**Acceptance:** sign in on one browser context, play, then sign in on a second context and see progress resume; reconciliation integration tests pass; offline play still works and syncs on reconnect.

---

## Milestone M3 — PWA + polish + accessibility

**Prompt to Devin:**
> Add vite-plugin-pwa: manifest (icons 192/512/maskable, standalone, portrait, theme `#0F1419`), and a service worker that precaches the app shell and seed.json, runtime-caches `GET /cards` stale-while-revalidate, and network-firsts `/progress`. Make a full session playable offline. Do an accessibility pass to WCAG AA: keyboard operability, visible focus, ARIA labels on interactive elements, and `prefers-reduced-motion`. Add card-deal and momentum animations at 60fps. Respect iOS safe areas.

**Acceptance:** Lighthouse PWA installable; offline session works; Lighthouse a11y ≥ 95; reduced-motion honored; installs to home screen on mobile.

---

## Milestone M4 — Scorecard & share

**Prompt to Devin:**
> Build the end-of-session scorecard: rank + letter grade (thresholds in ARCHITECTURE.md), points, best streak, and per-family mastery bars (hits/seen). Add a "Copy scorecard" action using the Web Share API on mobile with a clipboard fallback. Animate the mastery bars filling on entry.

**Acceptance:** scorecard shows correct rank/mastery; Web Share opens the native sheet on mobile; clipboard fallback works on desktop.

---

## Milestone M5 — Content pipeline & scale

**Prompt to Devin:**
> Add an admin-only content import: a script + protected endpoint to upsert cards from a versioned JSON file into Postgres, bumping the cards `version` so clients refetch. Add a Boss Deals mode (12 cards weighted to tiers 3–4) and a Family Focus mode (drill one family). Add PostHog analytics events for: session_start, round_answered (with tier/correct/wager), session_complete (score/accuracy), scorecard_shared.

**Acceptance:** importing an expanded seed grows the bank with no app code change; Boss and Family modes work; analytics events fire.

---

## Guardrails for the agent (put these in every prompt)

- Keep `leitner.ts` and `scoring.ts` **pure and fully unit-tested** — they are the correctness core.
- Mobile-first: design at 390px, tap targets ≥ 44px, no hover-only UI.
- Do not invent content — all scenarios come from `seed.json`; if a field is missing, fail the content test rather than fabricating.
- Every milestone ends in a green build, passing tests, and a reviewable PR.
