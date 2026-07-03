# Content Style Guide — Read the Room

The game is only as good as its scenarios. This guide keeps every card **accurate, plausible, and pedagogically sound** as the bank grows from 43 → 60 → 100+.

---

## The card contract

Every card MUST have all fields, and each must do its specific job:

| Field | Job | Rules |
|---|---|---|
| `prompt` | The buyer's actual words / an observable signal | First-person or observed. Realistic, specific, no jargon the buyer wouldn't use. 1–2 sentences. |
| `family` | The situation category (A–H) | Must be the single best fit. |
| `tier` | Difficulty / skill (1–4) | 1 recognize · 2 root cause · 3 diagnostic · 4 objection. |
| `pattern` | The named pattern to recall | Short, memorable, teachable. |
| `rootCause` | What's really going on beneath the symptom | The insight the player should internalize. |
| `consequence` | Why it creates urgency (business impact) | Cost, risk, velocity, or talent — name which. |
| `diagnostic` | The sharp question to ask back | Must reveal root cause AND build trust. This is the money field. |
| `angle` | How the solution addresses it | Honest, specific, tied to real capability. |
| `objection` | The realistic pushback | What a skeptical buyer actually says. |
| `reframe` | The best response | Never dismissive; acknowledge → reframe → validate. |
| `personaShift` | CTO/VPE/CFO/CRO framings | Same reality, four languages. |

---

## The eight situation families

| Code | Family | Core reality |
|---|---|---|
| A | Mainframe / COBOL core | Undocumented decades-old core; key-person risk. |
| B | Framework version lag | Stuck N versions behind; upgrades lose to features. |
| C | Language / platform migration | Multi-year translations that stall and overrun. |
| D | Undocumented tribal knowledge | Systems only one person understands; no docs/tests. |
| E | Technical-debt drag | Accumulated debt silently eroding velocity. |
| F | Compliance-forced modernization | Mandatory, deadline-driven, no business ROI. |
| G | Talent & hiring pressure | Can't hire for / retain on legacy stacks. |
| H | Security & vulnerability exposure | Outdated dependencies → growing risk surface. |

---

## The four tiers (calibration)

- **Tier 1 — Recognize.** The prompt clearly signals one family. Distractors are other families. Tests fast recognition.
- **Tier 2 — Root cause.** The player must go beneath the symptom. Distractors are plausible-but-wrong causes (often the symptom itself, or an adjacent family's cause).
- **Tier 3 — Diagnostic.** The player picks the sharpest question. Distractors are weaker questions: too generic, too leading, or premature-solution.
- **Tier 4 — Objection.** The player picks the best reframe. Distractors are dismissive, defensive, or technically-wrong responses.

**Target mix per 50 cards:** ~20% T1, ~30% T2, ~28% T3, ~22% T4. Keep families roughly balanced (5–8 each).

---

## Accuracy rules (non-negotiable)

1. **The correct answer must be genuinely best**, not just keyed. A domain expert should agree.
2. **Distractors must be plausible-but-inferior** — no obviously silly options (that trains nothing).
3. **No overclaiming.** Angles reflect real capability. For agentic-coding claims, stay honest: incremental, human-approved, verification-gated. Never imply full autonomy or guaranteed outcomes.
4. **Diagnostic questions must be ones a real CTO would respect** — specific, revealing, non-generic.
5. **Reframes follow Acknowledge → Reframe → Validate.** Never dismissive of a real concern.
6. **Persona framings must actually differ** by what each role cares about (CTO capability/risk, VPE velocity/morale, CFO cost/ROI, CRO compliance/control).

---

## Writing voice

- Buyer prompts: how a real, slightly frustrated executive talks. Specific numbers help ("still on Angular 9", "eighteen months in").
- Everything else: plain, confident, expert. No hype adjectives. Specificity over cleverness.

---

## Adding new cards (process)

1. Draft in the same JSON shape (`/data/seed.json`).
2. Assign a unique ID: family letter + number (e.g. `E7`).
3. Run `npm run validate` — it checks fields, family, tier, uniqueness.
4. Peer-review for accuracy against these rules before merge.
5. Bump the seed `version` so clients refetch.

---

## Anti-patterns to avoid

- Trick questions where the "wrong" answer is defensible.
- Distractors that are all obviously wrong (no learning).
- Solution-first prompts that skip diagnosis.
- Reframes that "win" by dismissing the buyer's concern.
- Persona chips that just restate the same point four times.
