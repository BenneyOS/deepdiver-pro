# Read the Room — Technical Architecture

**Optimized for mobile web (PWA). Chosen for buildability by an agent and low operational overhead.**

---

## 1. Stack at a glance

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React + Vite + TypeScript** | Fast builds, huge ecosystem, agent-friendly, easy PWA. |
| Styling | **Tailwind CSS** | Utility-first suits mobile responsive work; consistent tokens. |
| State | **Zustand** | Minimal boilerplate for game/session state; easy to reason about. |
| PWA | **vite-plugin-pwa (Workbox)** | Service worker, offline caching, installability out of the box. |
| Backend | **Node + Fastify (TypeScript)** | Lightweight, fast, typed; simple REST. |
| Database | **PostgreSQL** | Relational fits users/cards/progress cleanly; robust. |
| ORM | **Prisma** | Type-safe schema + migrations; agent-friendly. |
| Auth | **Magic-link email (or OAuth via Auth provider)** | Passwordless is best on mobile; low friction. |
| Hosting (FE) | **Vercel / Netlify** | Zero-config static + edge; PWA-friendly. |
| Hosting (BE) | **Render / Railway / Fly.io** | Simple managed Node + Postgres. |
| Analytics | **PostHog (self-host or cloud)** | Product analytics + funnels for the success metrics. |

**Principle:** the game is fully playable offline against the embedded seed; the backend exists to *persist and sync* progress and (later) serve new content and team features. This keeps the mobile experience instant and resilient.

---

## 2. Frontend architecture

```
src/
  main.tsx                 # bootstrap, register service worker
  app/
    routes.tsx             # Home / Round / Scorecard / Profile / Auth
  game/
    engine/
      leitner.ts           # box math, selection weighting, due scheduling
      scoring.ts           # points, wager multiplier, momentum, streak
      session.ts           # build session queue, advance rounds
    components/
      ScenarioCard.tsx     # the buyer-quote card
      OptionList.tsx       # answer options
      Wager.tsx            # confidence wager
      Reveal.tsx           # diagnostic anatomy + persona chips
      MomentumMeter.tsx    # signature element
      Hud.tsx              # deal count / streak / points
      Scorecard.tsx        # shareable result
    store/
      useGameStore.ts      # Zustand: session, score, streak, momentum
      useProgressStore.ts  # Zustand: Leitner boxes, mastery (synced)
  data/
    seed.json              # embedded question bank (offline-first)
    schema.ts              # TypeScript types for cards
  sync/
    api.ts                 # typed fetch client
    syncQueue.ts           # optimistic writes + background sync
  pwa/
    sw.ts                  # service worker (Workbox)
  ui/                      # buttons, chips, primitives (Tailwind)
```

**Offline-first data flow**
1. On load, hydrate progress from **IndexedDB** (local source of truth for the session).
2. Play writes optimistically to local store + a **sync queue**.
3. When online + authed, the sync queue **PATCHes** Leitner deltas to the backend.
4. On login from a new device, backend state is **merged** into local (server wins on conflict per-card by higher box + latest timestamp).

**Why IndexedDB, not localStorage:** larger quota, structured, async — right for a growing progress set and offline sessions.

---

## 3. Backend architecture

```
server/
  src/
    index.ts               # Fastify bootstrap
    routes/
      auth.ts              # magic-link request/verify, session tokens
      cards.ts             # GET /cards (versioned), ETag caching
      progress.ts          # GET/PATCH /progress (Leitner sync)
      sessions.ts          # POST /sessions (record a completed session)
      leaderboard.ts       # (v2) opt-in scores
    lib/
      leitner.ts           # server-side validation of box transitions
      auth.ts              # token issue/verify (JWT)
    db/
      prisma/schema.prisma # data model
    middleware/
      rateLimit.ts, auth.ts, cors.ts
```

### REST endpoints (v1)

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/magic-link` | Request a sign-in link. |
| POST | `/auth/verify` | Exchange token → session JWT. |
| GET | `/cards?version=` | Fetch question bank (ETag/version cached). |
| GET | `/progress` | Fetch the user's Leitner + mastery state. |
| PATCH | `/progress` | Apply a batch of card deltas (box changes, seen/hit). |
| POST | `/sessions` | Record a completed session (score, answers) for analytics. |
| GET | `/me` | Profile summary (rank, totals). |

**Idempotency & conflict:** `PATCH /progress` accepts a batch with per-card `{cardId, box, seen, hit, lastAttemptAt}`. Server takes `max(box)` and latest timestamp; returns the reconciled state so the client can converge.

---

## 4. Data model (Prisma schema)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  createdAt     DateTime @default(now())
  progress      CardProgress[]
  sessions      GameSession[]
}

model Card {
  id            String   @id            // e.g. "A1"
  family        String                  // A..H
  tier          Int                     // 1..4
  prompt        String
  pattern       String
  rootCause     String
  consequence   String
  diagnostic    String
  angle         String
  objection     String
  reframe       String
  personaShift  Json                    // {CTO,VPE,CFO,CRO}
  version       Int      @default(1)
  active        Boolean  @default(true)
  progress      CardProgress[]
}

model CardProgress {
  id            String   @id @default(cuid())
  user          User     @relation(fields:[userId], references:[id])
  userId        String
  card          Card     @relation(fields:[cardId], references:[id])
  cardId        String
  box           Int      @default(1)    // Leitner 1..5
  seen          Int      @default(0)
  hit           Int      @default(0)
  nextDueAt     DateTime?
  lastAttemptAt DateTime?
  @@unique([userId, cardId])
}

model GameSession {
  id            String   @id @default(cuid())
  user          User     @relation(fields:[userId], references:[id])
  userId        String
  mode          String
  score         Int
  total         Int
  hits          Int
  maxStreak     Int
  answers       Json     // [{cardId,correct,tier,wager}]
  createdAt     DateTime @default(now())
}
```

---

## 5. The Leitner engine (shared contract)

Implement identically on client (for offline) and validate on server.

```
promote(box)  = min(5, box + 1)   // correct
demote(box)   = max(1, box - 1)   // wrong
selectionWeight(card, prog) =
    (6 - (prog?.box ?? 1))
  + (prog?.seen ? 0 : 3)          // unseen priority
  + random(0, 1.5)               // jitter
nextDueAt(box) = now + intervalFor(box)
  intervalFor = {1:1h, 2:8h, 3:1d, 4:3d, 5:7d}   // v1.1 time-based
```

Session queue = top-N cards by descending `selectionWeight`, excluding cards not yet `nextDueAt` (once time-scheduling is on).

---

## 6. Scoring contract

```
basePoints(tier)   = 100 + (tier - 1) * 20
wagerMultiplier    = hunch ? 1 : 2
roundPoints        = correct ? basePoints * wagerMultiplier : 0
streak             = correct ? streak + 1 : 0
momentum          += correct ? 12 * wager : -14   // clamp 0..100
```

Rank thresholds (by read-accuracy %): 0 Prospect · 35 SDR · 55 Account Exec · 72 Senior Seller · 88 Diagnostic Closer.

---

## 7. PWA & mobile specifics

- **Manifest:** name, icons (192/512/maskable), `display: standalone`, portrait, theme color = ink `#0F1419`.
- **Service worker:** precache app shell + `seed.json`; runtime-cache `GET /cards` with stale-while-revalidate; network-first for `/progress`.
- **Offline:** full session playable from cache; progress writes queue and flush on reconnect.
- **Touch:** 44px min targets, swipe-to-advance on reveal (optional), no hover-only affordances.
- **Safe areas:** respect iOS notch (`env(safe-area-inset-*)`).

---

## 8. Security & privacy

- Passwordless auth; JWT sessions (short-lived + refresh).
- Rate-limit auth and PATCH endpoints.
- No PII beyond email; progress is not sensitive.
- CORS locked to the FE origin.
- All content is authored/curated (no user-generated content in v1) — no injection surface.

---

## 9. Testing strategy

- **Unit:** leitner.ts and scoring.ts have exhaustive tests (these are the correctness core).
- **Component:** round flow, wager, reveal render states.
- **E2E (Playwright):** complete a session offline; sign in; verify progress syncs and resumes on a second context.
- **Content validation:** a CI script asserts every card has all fields, valid family/tier, and no duplicate IDs.

---

## 10. Why this is a good fit for a Devin build

- Clear module boundaries → parallelizable tasks.
- Pure-logic cores (leitner, scoring) are perfect for **test-first** agent work.
- Typed schema end-to-end (Prisma + TS) reduces ambiguity.
- Seed data is provided and validated up front, so the agent isn't inventing content.
