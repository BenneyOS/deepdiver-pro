# Read the Room

A mobile-first, spaced-repetition training game that converts strong communicators into expert **diagnostic sellers** of enterprise technology modernization.

Read what an enterprise buyer is really telling you, name the root cause, ask the sharp question, handle the objection. Across mainframes, legacy stacks, technical debt, migrations, talent, and security.

## Play Online

**[https://benneyos.github.io/deepdiver-pro/](https://benneyos.github.io/deepdiver-pro/)**

The game auto-deploys to GitHub Pages on every push to `main`.

## Quick Start (Local Development)

```bash
git clone https://github.com/BenneyOS/deepdiver-pro.git
cd deepdiver-pro
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (hot reload) |
| `npm run build` | TypeScript check + production build |
| `npm run test` | Run unit tests (Vitest, 50 tests) |
| `npm run lint` | Lint with oxlint |
| `npm run validate` | Validate seed.json content against schema |
| `npm run preview` | Preview production build locally |

## Game Modes

| Mode | Cards | Description |
|------|-------|-------------|
| **Quick Drill** | 7 | Spaced repetition targets your weakest areas |
| **Boss Deals** | 12 | Weighted to tiers 3-4 (diagnostics & objections) |
| **Family Focus** | 7 | Drill a single situation family |

## How It Works

1. **Read the buyer quote** -- a real-world enterprise scenario, rendered in serif italic
2. **Pick an answer** from four options (tap triggers a spring bounce)
3. **Place your wager** -- Hunch (x1) or Read the Room (x2)
4. **See the reveal** -- Ada the owl gives you expert-peer feedback, full card anatomy shown
5. **Track your progress** -- momentum meter, streak counter, and Leitner box promotion

Cards you get right are promoted through 5 Leitner boxes (shown less often); cards you miss are demoted to Box 1 (shown more). The algorithm adapts to you over time.

## Design System

- **Palette:** Deep ink (`#14161C`) + gold accent (`#E8B84B`), semantic green/rose for correct/wrong only
- **Typography:** Inter (body), Lora italic (buyer quotes), JetBrains Mono (scores & telemetry)
- **Ada the Owl:** Mascot with 5 expression states -- neutral, pleased, thinking, impressed, unbothered
- **Motion:** 3 signature moments (reward burst, agentic log, rank-up) + calm everyday animations
- **Accessibility:** WCAG AA contrast, 44px+ touch targets, `prefers-reduced-motion` support, ARIA labels

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4 |
| State | Zustand 5, IndexedDB (progress), localStorage (sessions) |
| Backend | Fastify, Prisma 6, PostgreSQL (optional -- game works offline) |
| Testing | Vitest (50 frontend + 5 server integration tests) |
| CI/CD | GitHub Actions (lint, test, build, deploy to Pages) |
| PWA | Service worker, offline caching, installable |

## Content

43 scenarios across 8 situation families (A-H) and 4 difficulty tiers:

| Tier | Skill | Description |
|------|-------|-------------|
| T1 | Recognize | Identify the buyer signal |
| T2 | Root Cause | Name what's really going on |
| T3 | Diagnostic | Ask the sharp question |
| T4 | Objection | Handle the pushback |

Every card carries the full diagnostic anatomy: prompt, pattern, root cause, consequence, diagnostic question, angle, objection, reframe, and four persona framings (CTO / VP Eng / CFO / CRO).

## Project Structure

```
src/
  App.tsx                  # Main app shell & phase router
  index.css                # Design tokens, palette, animations
  data/
    seed.json              # 43 scenario cards
    schema.ts              # Zod types for cards, families, tiers
  game/
    engine/
      leitner.ts           # Spaced repetition algorithm
      scoring.ts           # Points, streaks, momentum, ranks
      session.ts           # Round builder, queue selection
    components/
      PathHomeScreen.tsx   # Winding path of family nodes
      Ada.tsx              # Owl mascot SVG (5 expressions)
      AgenticLog.tsx       # AI "thinking" wait-state
      Hud.tsx              # Deal counter, streak, score
      MomentumMeter.tsx    # Dynamic momentum bar
      OptionList.tsx       # Answer buttons with spring bounce
      Wager.tsx            # Confidence wager (Hunch / Read the Room)
      Reveal.tsx           # Result banner + card anatomy
      Scorecard.tsx        # Rank-up celebration + mastery bars
      ParticleBurst.tsx    # Particle effect for celebrations
    store/
      useGameStore.ts      # Zustand game state
      useProgressStore.ts  # IndexedDB Leitner progress
      useSessionHistory.ts # localStorage session log
server/                    # Optional Fastify backend
  src/
    routes/                # Auth, cards, progress, sessions, admin
    lib/                   # Prisma client, JWT auth
```

## GitHub Pages Setup

If deploying for the first time:

1. Go to **Settings > Pages** and set Source to **GitHub Actions**
2. Go to **Settings > General** and ensure the default branch is `main`
3. Go to **Settings > Environments > github-pages > Deployment branches** and set to **No restriction** (or add `main`)

The CI workflow handles build and deploy automatically on every push to `main`.

## License

MIT
