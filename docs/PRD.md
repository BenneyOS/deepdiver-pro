# Read the Room — Product Requirements Document (PRD)

**Version:** 1.0 · **Owner:** Bennett Carroll · **Status:** Build-ready for Devin

---

## 1. One-line summary

A mobile-first, spaced-repetition training game that converts strong communicators into expert **diagnostic sellers** of enterprise technology modernization — teaching players to read what a buyer is really saying, name the root cause, ask the sharp question, and handle the objection.

## 2. Problem & thesis

Enterprise tech sales teams can hire people with great instincts but no technical-diagnostic depth. Ramping them to credibly diagnose legacy pain (mainframes, tech debt, migrations, security exposure) takes months of osmosis. **Thesis:** that diagnostic skill is a learnable pattern-recognition system, and a spaced-repetition game can compress the ramp from months to weeks while being genuinely fun.

## 3. Goals & non-goals

**Goals (v1)**
- Deliver a polished, installable (PWA) mobile-web game.
- Teach and reinforce diagnostic pattern-recognition via spaced repetition.
- Persist per-user progress across sessions and devices (account-based).
- Provide a shareable scorecard for virality and (for the author) demonstration.
- Ship a content pipeline so the question bank can grow without code changes.

**Non-goals (v1)**
- Native iOS/Android apps (PWA covers mobile install).
- Multiplayer/real-time head-to-head (design for it later; don't build now).
- Content authoring UI for end users (seed + admin-only for v1).
- Payments/monetization (architect so it's addable; don't build).

## 4. Target users

1. **New enterprise-tech sellers** (primary) — SDRs/AEs ramping into a modernization-selling motion.
2. **Sales enablement leads** — who assign and track team progress (light v1: shareable scores; full team dashboards are v2).
3. **The author** — as a live demonstration artifact of proactivity + agentic-tool fluency.

## 5. Core gameplay (the loop)

Each **round** presents a **scenario card**: a realistic buyer quote. The player is challenged at one of four **tiers**:

| Tier | Skill | The challenge |
|---|---|---|
| 1 | Recognize | Identify the situation family |
| 2 | Diagnose | Name the root cause beneath the symptom |
| 3 | Probe | Choose the sharpest diagnostic question |
| 4 | Handle | Choose the best objection reframe |

**Round flow:** show card → player selects an answer → **confidence wager** (Hunch ×1 / Read-the-room ×2) → resolve → **reveal** full diagnostic anatomy (root cause, consequence, diagnostic, angle, objection+reframe, per-persona framing) → next.

**Scoring:** base points scale with tier; wager multiplies; correct builds **streak** and **Deal Momentum**; wrong resets streak and drains momentum.

**Session types:**
- **Quick Drill** — 7 cards, spaced-repetition selects the player's weak spots.
- **Boss Deals** — 12 cards, weighted to tiers 3–4 (questions & objections).
- **Family Focus** (v1.1) — drill a single situation family.

## 6. Learning engine (must be correct)

- **Leitner spaced repetition.** Each card has a per-user **box (1–5)**. Correct → promote (max 5), appears less often. Wrong → demote (min 1), resurfaces sooner. Unseen cards get priority.
- **Selection weighting:** `weight = (6 - box) + (unseen ? 3 : 0) + jitter`. Higher weight = more likely to be served.
- **Mastery** per family = hits / seen; surfaced on the scorecard.
- **Due scheduling (v1.1):** attach a `nextDueAt` timestamp per card-box for time-based resurfacing, not just session weighting.

## 7. Key screens

1. **Home / Start** — modes, streak, cards-seen/mastered, "resume."
2. **Round** — HUD (deal count, streak, points), Deal Momentum meter, scenario card, options, wager, reveal.
3. **Scorecard** — rank, grade, points, best streak, per-family mastery bars, share button.
4. **Profile (v1.1)** — history, mastery over time, settings.
5. **Auth** — sign-in (magic-link or OAuth), used to sync progress across devices.

## 8. Non-functional requirements

- **Mobile-first:** designed at 375–430px width first; thumb-reachable controls; large tap targets (min 44px).
- **PWA:** installable, offline-capable for a cached session; service worker.
- **Performance:** first interactive < 2.5s on mid-tier mobile; card transitions 60fps.
- **Accessibility:** WCAG AA; keyboard operable; visible focus; `prefers-reduced-motion` respected; screen-reader labels on interactive elements.
- **Resilience:** works offline for the current session; syncs progress when back online (optimistic local write, background sync).

## 9. Success metrics

- **Activation:** % who complete their first session.
- **Retention:** D1/D7 return rate (spaced repetition should drive D7).
- **Learning:** average family mastery improvement over first 5 sessions.
- **Virality:** scorecard shares per active user.

## 10. Content quality bar (non-negotiable)

Every scenario card must have all fields populated and be **factually defensible** about enterprise modernization. Answers can't rely on trick distractors; the "correct" option must be genuinely the best, and distractors must be plausible-but-inferior. See `CONTENT_STYLE.md`.

## 11. Milestones

- **M0 — Skeleton:** repo, data schema, seed loaded, static round rendering.
- **M1 — Core loop:** wager, scoring, momentum, reveal, one session end-to-end (local only).
- **M2 — Persistence:** auth + backend sync of Leitner state; resume across devices.
- **M3 — PWA + polish:** installable, offline session, animations, accessibility pass.
- **M4 — Scorecard + share:** shareable scorecard, mastery bars.
- **M5 — Content pipeline:** admin seed/import; grow the bank to 60+ without code changes.
