// Family O — "Case Files: Real Customer Wins".
//
// A situational unit built from the 16 Devin customer stories at
// https://devin.ai/customers. Unlike families A–N (which drill a single client
// PAIN), each Case Files card is grounded in a real named account and teaches
// the GO-TO-MARKET MOTION that won or expanded that deal.
//
// The cards are ordered so each 5-card lesson (LESSON_SIZE = 5) maps to ONE of
// the seven recurring GTM motions:
//   L0  Client-Zero Proof
//   L1  Beachhead on the Dreaded Migration
//   L2  Bottoms-Up Land-and-Expand
//   L3  Top-Down Mandate + Enablement
//   L4  Win the Bake-Off
//   L5  Ride the Industry Inflection
//   L6  Productize into a Partner Offering
//
// `pattern` is the motion (the Tier-1 "which motion is playing out?" answer), so
// distractors are the sibling motions. `customer`/`gtmMotion`/`proofMetric` are
// case-study metadata; the Reveal surfaces the real outcome as a proof point.
export default [
  // ===================================================================
  // L0 — Client-Zero Proof: prove it on your own org, then sell outward.
  // ===================================================================
  {
    "tier": 1,
    "prompt": "We're a services firm. Before we put an AI software engineer in front of enterprise clients, we need to know it holds up in real production — on our own stack.",
    "pattern": "Client-Zero Proof",
    "rootCause": "You can't credibly sell a transformation you haven't run on yourself first.",
    "consequence": "Advice without first-hand proof reads as vendor hype and gets discounted by buyers.",
    "diagnostic": "What would you need to see on your own codebase before you'd stake your name on this with a client?",
    "angle": "Run a bounded internal pilot first — defined use cases, baselines, success criteria — then sell the proven playbook, not a promise.",
    "objection": "Our clients' environments look nothing like our internal stack.",
    "reframe": "That's exactly why we prove the method, not the environment. The internal pilot hands you baselines, reusable playbooks, and ROI numbers you can carry into any client engagement.",
    "customer": "AHEAD",
    "gtmMotion": "Client-Zero Proof",
    "proofMetric": "8x–40x time savings across 8 pilot use cases; Devin is now the keystone of AHEAD's paid AI-accelerated-development offering",
    "personaShift": {
      "CTO": "de-risks a client-facing bet by proving it on a known system first",
      "VPE": "gives the team real baselines instead of vendor benchmarks",
      "CFO": "turns an unproven spend into a measured, ROI-backed investment",
      "CRO": "lets you sell an outcome you've personally verified, not a claim"
    }
  },
  {
    "tier": 2,
    "prompt": "Leadership keeps asking for an AI strategy deck, but nobody here has actually shipped anything real with an agent yet.",
    "pattern": "Client-Zero Proof",
    "rootCause": "Strategy is being written ahead of any first-hand evidence, so it's all theory.",
    "consequence": "Big-bang rollouts launched on theory stall the moment they hit real workflows.",
    "diagnostic": "Which single team could run this for two weeks and produce numbers the rest of the org would believe?",
    "angle": "Anchor the strategy on one team's measured pilot; let evidence, not slides, drive the rollout.",
    "objection": "We don't have time to pilot — the board wants the plan now.",
    "reframe": "A two-week pilot IS the plan's foundation. Bring the board a result instead of a hypothesis and the mandate writes itself.",
    "customer": "AHEAD",
    "gtmMotion": "Client-Zero Proof",
    "proofMetric": "AHEAD's internal rollout became the exact blueprint it now sells to the world's largest companies",
    "personaShift": {
      "CTO": "replaces a theoretical roadmap with an evidence-led one",
      "VPE": "protects delivery by proving the workflow before scaling it",
      "CFO": "spends against a measured result, not a forecast",
      "CRO": "arms the pitch with a real internal case, not a slide"
    }
  },
  {
    "tier": 3,
    "prompt": "We maintain a big open-source SDK. The integration backlog is growing faster than our contributors can clear it, and we're not sure an agent can really help.",
    "pattern": "Client-Zero Proof",
    "rootCause": "An unproven hypothesis: can an agent scale routine contribution work without hurting quality?",
    "consequence": "Left untested, the backlog compounds and the maintainers burn out on rote integrations.",
    "diagnostic": "If we ran a bounded trial on your integration backlog, what merge rate and quality bar would prove the hypothesis?",
    "angle": "Frame the first engagement as a cheap, falsifiable experiment on real backlog — start easy, teach iteratively, measure the merge rate.",
    "objection": "We've been burned by tools that overpromise on our codebase.",
    "reframe": "So don't take our word — set the success bar yourself and we'll run against your live backlog. If Devin doesn't clear it at your quality bar, you've lost a few days, not a quarter.",
    "customer": "Crossmint",
    "gtmMotion": "Client-Zero Proof",
    "proofMetric": "During its trial Devin became Crossmint's #1 contributor by PR count (8 merged vs. the next contributor's 4)",
    "personaShift": {
      "CTO": "treats adoption as a measurable experiment, not a leap of faith",
      "VPE": "clears backlog toil so contributors focus on architecture",
      "CFO": "caps downside — a bounded trial costs days, not a program",
      "CRO": "earns proof points from the customer's own success bar"
    }
  },
  {
    "tier": 4,
    "prompt": "Our engineers already tried AI assistants in their IDEs and saw only marginal gains. Why would this be different?",
    "pattern": "Client-Zero Proof",
    "rootCause": "Assumption that all AI coding tools are the same autocomplete-grade help.",
    "consequence": "One underwhelming tool trial poisons the org against the whole category.",
    "diagnostic": "What would a step-change — not a 10% autocomplete lift — actually look like in your capacity numbers?",
    "angle": "Reframe the goal from IDE suggestions to end-to-end task ownership, and make delegation a measured, teachable skill.",
    "objection": "How do we even know it's adding capacity and not just noise?",
    "reframe": "Measure it directly: score every task on specificity, back-and-forth, and whether the change improved the codebase. Delegation becomes a tracked skill, and the capacity gain shows up in the data — not vibes.",
    "customer": "FE fundinfo",
    "gtmMotion": "Client-Zero Proof",
    "proofMetric": "10% immediate engineering-capacity gain; a scoring system made AI delegation a measurable, teachable skill",
    "personaShift": {
      "CTO": "distinguishes autonomous task ownership from autocomplete",
      "VPE": "makes delegation skill visible and coachable across the team",
      "CFO": "ties spend to a tracked capacity metric, not anecdote",
      "CRO": "counters 'we already tried AI' with a measured contrast"
    }
  },
  {
    "tier": 3,
    "prompt": "If we commit to this, how do we make sure the whole engineering org actually gets better at using it — not just a couple of enthusiasts?",
    "pattern": "Client-Zero Proof",
    "rootCause": "Adoption depends on a mindset shift from executor to coordinator, which won't happen on its own.",
    "consequence": "Without deliberate enablement, value stays trapped in a few power users and never compounds.",
    "diagnostic": "What behaviors would you measure to know an engineer has learned to delegate well versus just dabbling?",
    "angle": "Bake the internal proof into a repeatable enablement system — scoring, playbooks, tracked outcomes — so the skill spreads by design.",
    "objection": "We can't force a whole culture to change how it works.",
    "reframe": "You don't force it — you make the win visible and the skill measurable. Once engineers see peers offloading the work they hate, adoption pulls itself forward.",
    "customer": "FE fundinfo",
    "gtmMotion": "Client-Zero Proof",
    "proofMetric": "Projected 2–4x engineering-capacity increase over 2–5 years; playbooks now run Devin across 1,800 repositories",
    "personaShift": {
      "CTO": "builds a durable capability, not a one-off pilot",
      "VPE": "turns early wins into a team-wide operating model",
      "CFO": "protects the investment by ensuring org-wide uptake",
      "CRO": "shows a repeatable adoption path, de-risking the deal"
    }
  },

  // ===================================================================
  // L1 — Beachhead on the Dreaded Migration: land on the one migration
  //      nobody wants; fixed teach-cost, then autonomous scale.
  // ===================================================================
  {
    "tier": 1,
    "prompt": "Our core ETL is an 8-year-old, multi-million-line monolith. Splitting it up is a multi-year job spread across a thousand engineers — everyone dreads it.",
    "pattern": "Beachhead on the Dreaded Migration",
    "rootCause": "A high-volume, repetitive migration that's too big to staff manually and too discretionary to script.",
    "consequence": "The project either gets deferred forever or consumes the org's engineering capacity for years.",
    "diagnostic": "Which migration have you deferred because it's too big to staff but too important to abandon?",
    "angle": "Land on that exact migration: invest a small fixed cost to teach the agent the sub-task, then run an 'army of agents' in parallel with humans reviewing.",
    "objection": "A migration this delicate can't be automated — there are too many edge cases.",
    "reframe": "That's why we don't script it. We teach the agent on your own past examples, prove it on a benchmark set, then scale — with an engineer approving every PR. You buy a measured result on one slice before committing to the program.",
    "customer": "Nubank",
    "gtmMotion": "Beachhead on the Dreaded Migration",
    "proofMetric": "8–12x efficiency gain and 20x cost savings; units finished migrations in weeks instead of months or years",
    "personaShift": {
      "CTO": "makes an impossible roadmap item finally tractable",
      "VPE": "lifts the dreaded toil off every engineer's plate",
      "CFO": "collapses a multi-year program's cost by an order of magnitude",
      "CRO": "delivers the migration months ahead, freeing capacity for revenue work"
    }
  },
  {
    "tier": 2,
    "prompt": "New regulations mean we have to change tax-ID handling across hundreds of thousands of files — including COBOL and other legacy stacks. We'd written it off as impossible to automate.",
    "pattern": "Beachhead on the Dreaded Migration",
    "rootCause": "A compliance-driven change fanning out across a massive, mixed-stack legacy estate.",
    "consequence": "Manual remediation at that scale is infeasible, so the deadline becomes an existential risk.",
    "diagnostic": "Which regulatory change is blocked purely because the surface area across your legacy code is too large to touch by hand?",
    "angle": "Use the forced, well-defined change as the beachhead — the rules define 'done,' so the agent can fan the same edit across every application under review.",
    "objection": "Nobody automates changes across COBOL at this scale.",
    "reframe": "That's precisely the win. The change is mechanical and the target is defined by regulation — ideal for agents to apply across all applications while your engineers review, turning an 'infeasible' mandate into a tracked rollout.",
    "customer": "Itaú",
    "gtmMotion": "Beachhead on the Dreaded Migration",
    "proofMetric": "Itaú automated CNPJ compliance changes across 300,000+ repos; a related SQL Server migration of 800 objects finished 5x faster",
    "personaShift": {
      "CTO": "makes a previously-infeasible legacy change achievable",
      "VPE": "spares the team a soul-crushing manual fan-out",
      "CFO": "avoids the cost and risk of missing a regulatory deadline",
      "CRO": "keeps the institution compliant without a capacity crisis"
    }
  },
  {
    "tier": 3,
    "prompt": "We committed to a Redshift-to-Snowflake cutover, but the final BI layer is 14,000 dashboard cards. It's trending months late and we'd need three or four more engineers.",
    "pattern": "Beachhead on the Dreaded Migration",
    "rootCause": "A high-volume translation with per-item dialect and casing edge cases, gated on scarce engineers.",
    "consequence": "The cutover slips a quarter or more and blocks decommissioning the old warehouse.",
    "diagnostic": "If you could partition this into thousands of independent sub-tasks, how many agents in parallel would it take to hit your date?",
    "angle": "Scope the problem WITH the agent first, build a few composable tools, then run many agents in parallel — each owning one collection end to end.",
    "objection": "Isn't handing 14,000 cards to an AI just trading one mess for another?",
    "reframe": "Not if each agent validates its own work against the source. Devin reconciles both warehouses per card and only surfaces clean, verified cutovers — so you scale confidence, not risk.",
    "customer": "AngelList",
    "gtmMotion": "Beachhead on the Dreaded Migration",
    "proofMetric": "Cutover 5.2x faster than the team's own estimate — a year of work delivered in four months, at peak 20 agents in parallel",
    "personaShift": {
      "CTO": "hits the migration date without expanding headcount",
      "VPE": "parallelizes work that was bottlenecked on a few people",
      "CFO": "avoids hiring 3–4 engineers to force the deadline",
      "CRO": "unblocks decommissioning the legacy stack on schedule"
    }
  },
  {
    "tier": 4,
    "prompt": "We're private-equity backed and acquisition-heavy, so we have legacy sprawl everywhere. Frankly, I don't trust AI-generated code to meet our standards.",
    "pattern": "Beachhead on the Dreaded Migration",
    "rootCause": "Distrust that agent output can match human quality on a legacy modernization.",
    "consequence": "Fear of added tech debt keeps the modernization backlog frozen indefinitely.",
    "diagnostic": "What signal at the pull-request level would convince you the output is production-grade, not just plausible?",
    "angle": "Land on one legacy modernization and measure quality where it's undeniable: merged PRs at your normal review bar, with tests and static analysis driving coverage.",
    "objection": "How do we know this isn't just adding technical debt we'll pay for later?",
    "reframe": "Judge it at the PR level, exactly like a human contributor. Track merge rate and coverage on a real project — if the PRs don't pass senior review at your standard, they don't merge. The signal is clean and production-level.",
    "customer": "The Citation Group",
    "gtmMotion": "Beachhead on the Dreaded Migration",
    "proofMetric": "A 3-month migration (.NET Framework/AngularJS → .NET Core/React 18) reached a working prototype in 2 weeks with 90%+ coverage; 271 PRs merged at an 80% rate",
    "personaShift": {
      "CTO": "modernizes legacy without lowering the quality bar",
      "VPE": "clears migration backlog that slipped sprint after sprint",
      "CFO": "compresses a multi-month program into weeks",
      "CRO": "proves quality with a clean PR-level signal, not a claim"
    }
  },
  {
    "tier": 2,
    "prompt": "We need to move legacy product components onto a modern TypeScript/Next.js stack, but each component takes about a week of focused engineering. There are a lot of them.",
    "pattern": "Beachhead on the Dreaded Migration",
    "rootCause": "A repeatable per-component migration whose cost is fixed and multiplied across the whole product.",
    "consequence": "The modernization roadmap crawls, and the team can't match the pace of the market.",
    "diagnostic": "Once you've proven one component migration, what stops you from replaying the exact pattern across the rest?",
    "angle": "Migrate one component as a feasibility test; once the pattern holds, it's repeatable across the estate with only a few human touchpoints per unit.",
    "objection": "A migration touching backend, API, and UI is too tangled to hand off.",
    "reframe": "It's tangled once, then patterned. Prove it on a single component end to end — backend logic, API, UI, validation — and the same recipe replays across the rest while engineers handle only the exceptions.",
    "customer": "Evinova",
    "gtmMotion": "Beachhead on the Dreaded Migration",
    "proofMetric": "Devin migrated 3 components in ~1.5 days (vs. ~5 days each manually), touching 58 files across 3 repos with only 9 points needing engineer input",
    "personaShift": {
      "CTO": "advances the modernization roadmap at market speed",
      "VPE": "converts a slow slog into a repeatable, low-touch pattern",
      "CFO": "turns per-component cost into a shrinking, predictable line",
      "CRO": "keeps the platform competitive as the stack evolves"
    }
  },

  // ===================================================================
  // L2 — Bottoms-Up Land-and-Expand: design-partner / pilot pod →
  //      viral engineer pull → org-wide.
  // ===================================================================
  {
    "tier": 1,
    "prompt": "A few of our engineers started using it for small one-shot tasks, and now they're pulling it into bigger projects on their own. Usage is spreading without us pushing it.",
    "pattern": "Bottoms-Up Land-and-Expand",
    "rootCause": "Genuine day-to-day value creates organic pull that outruns any top-down rollout plan.",
    "consequence": "If you don't widen access, demand backs up and the momentum stalls.",
    "diagnostic": "Where is usage already growing on its own, and what's the friction stopping it from spreading further?",
    "angle": "Start as a design partner with one pod, let the organic pull build, then widen access across the org to meet the demand.",
    "objection": "Grassroots tools never scale cleanly to the whole org.",
    "reframe": "This one scales because engineers are pulling it, not being pushed. Your job isn't to create demand — it's to remove the access friction so the pull you already have can spread.",
    "customer": "Bilt",
    "gtmMotion": "Bottoms-Up Land-and-Expand",
    "proofMetric": "Grew from a small pilot pod to 106 engineers (over half using it weekly); engineers ship ~10x faster",
    "personaShift": {
      "CTO": "scales a proven, demand-led adoption instead of forcing one",
      "VPE": "rides real engineer enthusiasm into org-wide velocity",
      "CFO": "invests behind demonstrated pull, not speculative rollout",
      "CRO": "expansion is driven by usage, the healthiest signal there is"
    }
  },
  {
    "tier": 2,
    "prompt": "We piloted with one pod, but per-seat pricing means only a handful of people can touch it — so the rest of the company can't even try.",
    "pattern": "Bottoms-Up Land-and-Expand",
    "rootCause": "Seat-based access artificially caps who can experience the value, choking the organic spread.",
    "consequence": "Adoption plateaus at the licensed few and never reaches the teams that would benefit most.",
    "diagnostic": "If anyone in the company could kick off a task tomorrow, which non-engineering teams would jump on it first?",
    "angle": "Remove seat limits with pooled credits so anyone — engineering, support, marketing — can start via the tools they already live in, like Slack.",
    "objection": "Opening access to everyone will just burn budget on random experiments.",
    "reframe": "Pooled credits meter usage by value delivered, not seats occupied. Access widens, the best use cases surface from unexpected teams, and you pay for work done — not chairs.",
    "customer": "Gumroad",
    "gtmMotion": "Bottoms-Up Land-and-Expand",
    "proofMetric": "Pooled credits/no seat limits took Devin company-wide in weeks; 1,583 PRs merged in 4 months at an 85%+ merge rate — the #1 contributor",
    "personaShift": {
      "CTO": "unblocks org-wide access without seat gymnastics",
      "VPE": "lets value spread to whoever has the best use case",
      "CFO": "pays for work delivered, not idle seats",
      "CRO": "removes the friction that caps expansion revenue"
    }
  },
  {
    "tier": 3,
    "prompt": "Whenever we consider adding a new integration, we get stuck debating priority for weeks before anyone writes a line of code.",
    "pattern": "Bottoms-Up Land-and-Expand",
    "rootCause": "The cost of even attempting a task is so high that prioritization debates replace doing the work.",
    "consequence": "A backlog of small, valuable features never ships because deciding costs more than building.",
    "diagnostic": "How many of your backlog items would you just try immediately if attempting them were nearly free?",
    "angle": "Lower the cost-to-attempt to near zero — kick off a Devin per repo — so 'should we?' debates become 'let's just try it and see.'",
    "objection": "Letting people fire off tasks with no prioritization sounds chaotic.",
    "reframe": "It's the opposite of chaos — it collapses the debate. When attempting is cheap, you replace weeks of prioritization meetings with a same-day proof of concept the team can react to.",
    "customer": "Linktree",
    "gtmMotion": "Bottoms-Up Land-and-Expand",
    "proofMetric": "Linktree authored ~300 PRs and merged ~100 in a month; shipped a new social-platform integration across 5 repos the same day",
    "personaShift": {
      "CTO": "turns endless prioritization into fast experimentation",
      "VPE": "unblocks the small features that never make the cut",
      "CFO": "recovers the hidden cost of decision overhead",
      "CRO": "ships responsiveness customers actually notice"
    }
  },
  {
    "tier": 4,
    "prompt": "We move incredibly fast and measure ourselves on how much we ship per week. I'm worried an agent will just add bugs and slow us down.",
    "pattern": "Bottoms-Up Land-and-Expand",
    "rootCause": "Fear that autonomous output trades speed for quality in a fast-moving codebase.",
    "consequence": "The team avoids the tool and leaves a top contributor's worth of throughput on the table.",
    "diagnostic": "What makes a task well-bounded enough that you'd trust any new contributor — human or agent — to own it?",
    "angle": "Teach the team to identify well-specified, objectively-verifiable tasks; those are exactly what an agent ships cleanly at speed.",
    "objection": "Won't it just introduce bugs and cost us velocity?",
    "reframe": "Only if you point it at ambiguous work. Define the 'agent-able' tasks — bounded, clear spec, objective evals — and it ships as one of your top contributors. If your codebase is agent-unfriendly, it's engineer-unfriendly too.",
    "customer": "Hamming",
    "gtmMotion": "Bottoms-Up Land-and-Expand",
    "proofMetric": "Devin contributes 25% of Hamming's total code volume and ranks as a top contributor alongside their best engineers",
    "personaShift": {
      "CTO": "raises throughput without sacrificing code quality",
      "VPE": "gives the team a repeatable spec discipline for delegation",
      "CFO": "adds a top contributor's output without a hire",
      "CRO": "protects the ship-fast culture the business runs on"
    }
  },
  {
    "tier": 3,
    "prompt": "Even our non-engineers — support and marketing — keep asking engineering for small changes. Every request becomes a queue.",
    "pattern": "Bottoms-Up Land-and-Expand",
    "rootCause": "All change flows through engineering, so trivial asks create escalation queues and context-switching.",
    "consequence": "Engineers get pulled off deep work to triage, and simple requests wait days.",
    "diagnostic": "Which requests hit your engineers' queue that the requester could safely resolve themselves with the right assistant?",
    "angle": "Let support and marketing self-serve small changes through Devin in Slack, shielding engineers from triage while keeping PRs in the normal review flow.",
    "objection": "We can't have non-engineers pushing changes to our codebase.",
    "reframe": "They're not bypassing anything — every change is still a reviewed PR. Marketing swaps copy, support drafts a bug fix, and your engineers review instead of context-switching into triage.",
    "customer": "Gumroad",
    "gtmMotion": "Bottoms-Up Land-and-Expand",
    "proofMetric": "At Gumroad, marketing ships site copy and support drafts bug fixes via Devin; support once surfaced a currency-conversion bug breaking refunds",
    "personaShift": {
      "CTO": "expands who can safely contribute without new risk",
      "VPE": "shields engineers from triage and context-switching",
      "CFO": "recovers engineering hours lost to trivial requests",
      "CRO": "speeds customer-facing fixes without an engineering queue"
    }
  },

  // ===================================================================
  // L3 — Top-Down Mandate + Enablement: exec champion, structured
  //      initiative, new roles/scoring.
  // ===================================================================
  {
    "tier": 1,
    "prompt": "Our CTO saw this on stage and declared it the future of development. Now the mandate is company-wide — but our QE function is the bottleneck and we don't want a mess.",
    "pattern": "Top-Down Mandate + Enablement",
    "rootCause": "Executive conviction needs a structured program to convert a mandate into real adoption.",
    "consequence": "Top-down mandates without enablement produce shelfware and cynical teams.",
    "diagnostic": "Where would a focused, well-resourced initiative prove the mandate fastest and win the rest of the org?",
    "angle": "Pair the executive mandate with a named initiative — deconstruct the bottleneck function, build specialized agent workflows for each part, and embed them into teams.",
    "objection": "Top-down tech mandates always fizzle once the keynote buzz fades.",
    "reframe": "This one doesn't fizzle because it's mandate PLUS enablement: a structured program that rebuilds the bottleneck function around agents, with roles and metrics that make the change stick.",
    "customer": "Litera",
    "gtmMotion": "Top-Down Mandate + Enablement",
    "proofMetric": "Litera's 'QE Evolution' hit 40% more test coverage, 93% faster regression cycles, 10x QE output, and 90+ active users within weeks",
    "personaShift": {
      "CTO": "converts personal conviction into a structured program",
      "VPE": "attacks the real bottleneck with embedded agent workflows",
      "CFO": "backs a mandate that has a measurable enablement plan",
      "CRO": "shows a top-down deal that lands, not one that stalls"
    }
  },
  {
    "tier": 2,
    "prompt": "We tried A/B testing teams with and without the tool, but the results were muddy. We can't tell what's really working.",
    "pattern": "Top-Down Mandate + Enablement",
    "rootCause": "Treating an agent as a discrete tool misses that value compounds as teams commit and expand usage.",
    "consequence": "Measuring it like a point tool understates the impact and slows the commitment.",
    "diagnostic": "What happens to throughput when one squad fully commits, versus dabbling across many?",
    "angle": "Stop A/B dabbling; measure what happens when a squad commits fully, then scale the committed model org-wide.",
    "objection": "Without a clean A/B test, how do we justify going all-in?",
    "reframe": "A/B assumes a fixed tool applied to fixed tasks. In reality teams keep discovering new ways to use it — so measure a fully-committed squad's output. That's the signal that justifies the rollout.",
    "customer": "Itaú",
    "gtmMotion": "Top-Down Mandate + Enablement",
    "proofMetric": "One committed squad delivered 2 releases in 3 months (double the plan); adoption grew to 75% of teams with a ~1,000-developer waitlist",
    "personaShift": {
      "CTO": "measures the committed-team model, not a muddy A/B",
      "VPE": "sees compounding gains as teams expand usage organically",
      "CFO": "justifies the investment on a fully-committed squad's output",
      "CRO": "reads real demand from the internal waitlist"
    }
  },
  {
    "tier": 3,
    "prompt": "If we roll this out top-down, how do we make sure engineers actually get good at delegating to it instead of resenting it?",
    "pattern": "Top-Down Mandate + Enablement",
    "rootCause": "Adoption requires engineers to shift from executors to coordinators, a skill that must be taught.",
    "consequence": "Without deliberate enablement, a mandate breeds resentment and shallow usage.",
    "diagnostic": "How would you measure whether an engineer has actually learned to delegate well, so you can coach the rest?",
    "angle": "Make delegation a tracked, teachable skill — score specificity, back-and-forth, and codebase impact — so enablement is systematic, not hopeful.",
    "objection": "You can't teach a whole org to change how it works overnight.",
    "reframe": "You teach it the way you teach any skill: make it measurable. Score how well engineers delegate, coach from the data, and the mandate becomes capability instead of compliance.",
    "customer": "FE fundinfo",
    "gtmMotion": "Top-Down Mandate + Enablement",
    "proofMetric": "FE fundinfo's engineer scoring system drove a 10% immediate capacity gain and a projected 2–4x over 2–5 years",
    "personaShift": {
      "CTO": "turns a mandate into a durable, taught capability",
      "VPE": "coaches delegation skill from real data, not vibes",
      "CFO": "protects the rollout investment with measured skill growth",
      "CRO": "shows buyers a concrete enablement path, de-risking the deal"
    }
  },
  {
    "tier": 4,
    "prompt": "My QE staff are terrified this replaces them. How do I mandate adoption without gutting morale?",
    "pattern": "Top-Down Mandate + Enablement",
    "rootCause": "Fear that automation eliminates roles rather than elevating them.",
    "consequence": "A threatened team quietly resists, and the mandate dies from the bottom up.",
    "diagnostic": "What higher-value roles could your QE staff grow into once the rote testing is automated?",
    "angle": "Position the mandate as a career upgrade — QE staff become agent builders, SREs, and DevOps specialists — and create a role that champions the transition.",
    "objection": "Isn't this just a polite way of automating my team out of a job?",
    "reframe": "The opposite. The rote work goes to agents; your people move up into agent-builder, SRE, and DevOps roles. Name a champion role to lead it, and the team reinvents its careers instead of defending the status quo.",
    "customer": "Litera",
    "gtmMotion": "Top-Down Mandate + Enablement",
    "proofMetric": "At Litera a QE individual contributor rose to acting Director of Quality by leading the agent rollout; new 'AI composer' roles emerged",
    "personaShift": {
      "CTO": "elevates the team's charter instead of shrinking it",
      "VPE": "converts fear into an upskilling and retention story",
      "CFO": "redeploys talent to higher-value work, not layoffs",
      "CRO": "gives the mandate a morale-positive narrative that sticks"
    }
  },
  {
    "tier": 2,
    "prompt": "Our biggest hidden cost is that only a few senior engineers understand our sprawling legacy systems, and onboarding anyone new takes forever.",
    "pattern": "Top-Down Mandate + Enablement",
    "rootCause": "Institutional knowledge is trapped in a few heads across a massive codebase, throttling everyone else.",
    "consequence": "Onboarding drags, senior engineers are constant bottlenecks, and change is slow and risky.",
    "diagnostic": "What would change if any engineer could query your architecture like a tenured senior engineer, on demand?",
    "angle": "Deploy an always-current knowledge layer (auto-generated docs + search) as the enablement wedge, so the mandate makes the whole org faster, not just power users.",
    "objection": "Documentation always goes stale the moment it's written.",
    "reframe": "This documentation regenerates with every code change and answers questions with diagrams and dependency graphs. It's a living knowledge layer, not a stale wiki — so onboarding and modernization speed up permanently.",
    "customer": "Itaú",
    "gtmMotion": "Top-Down Mandate + Enablement",
    "proofMetric": "Itaú deployed Devin Wiki/Search across a 300,000+-repo codebase; principal engineers now design architecture ~10x faster",
    "personaShift": {
      "CTO": "builds durable organizational memory across the estate",
      "VPE": "cuts onboarding and unblocks juniors without senior time",
      "CFO": "reduces dependence on a few expensive key people",
      "CRO": "lowers key-person and continuity risk bank-wide"
    }
  },

  // ===================================================================
  // L4 — Win the Bake-Off: head-to-head eval, the only tool that
  //      finishes, PR-level ROI signal.
  // ===================================================================
  {
    "tier": 1,
    "prompt": "We're evaluating every major AI coding tool against real engineering challenges. We set a deliberately high bar: own a task end to end, with a full audit trail.",
    "pattern": "Win the Bake-Off",
    "rootCause": "The buyer will only trust a tool that provably completes their hardest real task, not a demo.",
    "consequence": "Tools that can't finish the hard task get eliminated no matter how good the pitch.",
    "diagnostic": "What's the one real task in your eval that you expect most tools to fail — and what does 'done' look like on it?",
    "angle": "Compete on the buyer's own hardest challenge; being the only tool that completes it end to end wins the deal outright.",
    "objection": "Every vendor claims they can handle our hardest task.",
    "reframe": "So don't take the claim — put it in the bake-off. Give every tool your real challenge with dependencies and no existing logic, and pick whichever actually finishes it. Let the eval decide.",
    "customer": "Evinova",
    "gtmMotion": "Win the Bake-Off",
    "proofMetric": "In Evinova's evaluation, Devin was the only tool to complete a complex task with third-party dependencies and no existing logic",
    "personaShift": {
      "CTO": "selects on proven capability, not marketing",
      "VPE": "trusts a tool that finished the team's real hard task",
      "CFO": "buys the winner of an objective, apples-to-apples test",
      "CRO": "de-risks the decision with an auditable head-to-head"
    }
  },
  {
    "tier": 2,
    "prompt": "We're safety-critical automotive. Any tool has to clear enterprise requirements — IDE support, a context engine for huge legacy code, mature security — before we even pilot.",
    "pattern": "Win the Bake-Off",
    "rootCause": "Enterprise buyers gate the eval on hard requirements before capability even gets tested.",
    "consequence": "Tools that miss the enterprise bar never reach the pilot, regardless of raw ability.",
    "diagnostic": "Which enterprise requirements are non-negotiable gates for you, and which tools clear all of them at once?",
    "angle": "Meet the full enterprise bar first, then split the work — interactive assistance for one need, autonomous background work for another — so each tool is used where it's strongest.",
    "objection": "We'd rather standardize on a single AI tool than juggle several.",
    "reframe": "Match the tool to the job: interactive coding assistance and autonomous background execution are different needs. Using the right one for each — both clearing your enterprise bar — beats forcing one tool to do everything.",
    "customer": "RV Tech (Rivian × Volkswagen)",
    "gtmMotion": "Win the Bake-Off",
    "proofMetric": "After a full enterprise evaluation, RV Tech adopted Windsurf for interactive coding and Devin for autonomous work; test-gen velocity rose 10x",
    "personaShift": {
      "CTO": "satisfies non-negotiable enterprise gates up front",
      "VPE": "puts the right tool on the right kind of work",
      "CFO": "avoids paying for a poor single-tool compromise",
      "CRO": "clears security and compliance requirements before pilot"
    }
  },
  {
    "tier": 3,
    "prompt": "Sprint velocity swings too much for us to isolate the tool's real impact. Leadership wants a clean signal before we scale.",
    "pattern": "Win the Bake-Off",
    "rootCause": "Noisy team-level metrics obscure the true contribution, stalling the scale decision.",
    "consequence": "Without a clean signal, the rollout stays stuck in perpetual evaluation.",
    "diagnostic": "What unit of output could you measure directly — at the PR level — to cut through the velocity noise?",
    "angle": "Measure impact where it's undeniable: merged PRs at your review bar. A clean PR-level signal replaces muddy velocity debates and unlocks the scale decision.",
    "objection": "Our metrics are too noisy to prove this is worth expanding.",
    "reframe": "Then stop measuring at the sprint level. Track Devin's merged PRs and merge rate directly — production-level output your seniors already reviewed. That's the clean signal leadership is asking for.",
    "customer": "The Citation Group",
    "gtmMotion": "Win the Bake-Off",
    "proofMetric": "By tracking PRs directly, Citation got a clean signal: 271 merged PRs at an 80% rate, plus a 147-PR feature (~367 story points) shipped in weeks",
    "personaShift": {
      "CTO": "bases the scale decision on a clean, direct signal",
      "VPE": "cuts through velocity noise to real output",
      "CFO": "ties spend to merged, reviewed production work",
      "CRO": "answers 'is it working?' with defensible numbers"
    }
  },
  {
    "tier": 4,
    "prompt": "Even if it wins the eval, I'm skeptical it'll deliver measurable ROI once it's running day to day.",
    "pattern": "Win the Bake-Off",
    "rootCause": "Doubt that eval-stage performance translates into sustained, quantifiable returns.",
    "consequence": "Without a running ROI number, the deal stalls at 'nice demo' and never scales.",
    "diagnostic": "What recurring, well-bounded workflow could run on a schedule and compound its return over time?",
    "angle": "Turn the eval win into a standing workflow — a scheduled playbook that works tickets end to end — and measure the compounding return on setup time.",
    "objection": "How do I know the ROI holds up beyond the pilot?",
    "reframe": "Instrument it as a recurring workflow, not a one-off. A playbook that runs several times a day and closes tickets end to end shows a return you can watch compound — the ROI is measured, not assumed.",
    "customer": "Evinova",
    "gtmMotion": "Win the Bake-Off",
    "proofMetric": "Evinova's 'AutoFixer' playbook attempted 79 bugs in 22 days, merging clean fixes for ~half — a 100% return on under two days of setup",
    "personaShift": {
      "CTO": "proves durable value, not a one-off eval result",
      "VPE": "automates a recurring workflow with compounding returns",
      "CFO": "sees ROI measured on setup cost, not promised",
      "CRO": "converts an eval win into a defensible business case"
    }
  },
  {
    "tier": 3,
    "prompt": "Our requirements-to-code-to-test traceability relies on brute-force meetings — systems and software engineers going line by line. It's slow and painful.",
    "pattern": "Win the Bake-Off",
    "rootCause": "Quality assurance depends on manual, meeting-heavy review that can't keep pace.",
    "consequence": "Slow review cycles bottleneck delivery and let requirement conflicts slip through.",
    "diagnostic": "If an agent generated your test cases and flagged conflicting requirements, where would your engineers add the most value?",
    "angle": "Have the agent ingest the framework, code, and requirements to generate and iterate test cases; engineers shift to verifying the tests check the right logic.",
    "objection": "Auto-generated tests won't catch the subtle issues our reviews do.",
    "reframe": "They catch more, sooner. In the pilot the agent even flagged conflicting requirements a human confirmed. Engineers stop writing boilerplate tests and start verifying logic across the whole V-model — faster and deeper.",
    "customer": "RV Tech (Rivian × Volkswagen)",
    "gtmMotion": "Win the Bake-Off",
    "proofMetric": "Devin writes ~100% of SIL test code, lifting output from 1–2 tests/day to 10–15; it even caught conflicting requirements needing revision",
    "personaShift": {
      "CTO": "raises quality coverage across the whole V-model",
      "VPE": "replaces brute-force review meetings with fast iteration",
      "CFO": "recovers engineer-hours lost to manual test authoring",
      "CRO": "strengthens safety-critical traceability and defensibility"
    }
  },

  // ===================================================================
  // L5 — Ride the Industry Inflection: sell the regulatory/market
  //      moment, not the feature.
  // ===================================================================
  {
    "tier": 1,
    "prompt": "Our whole industry is at a turning point — the carriers that can build and adapt software fastest will pull away from the ones stuck on legacy. We can't afford to be the latter.",
    "pattern": "Ride the Industry Inflection",
    "rootCause": "A market-wide shift makes engineering speed the deciding competitive factor, now.",
    "consequence": "Firms that move slowly at the inflection point get permanently outrun by faster rivals.",
    "diagnostic": "In your market, what becomes possible for the players who can ship and adapt software the fastest?",
    "angle": "Sell the inflection: when engineering capacity stops being the constraint, launching a product or entering a market becomes a question of intent, not headcount.",
    "objection": "This feels like hype — every vendor says the industry is 'transforming.'",
    "reframe": "The evidence is external: analysts estimate agentic AI can cut the slowest, costliest modernization cycles by up to 90%. The question isn't whether the shift happens — it's whether you lead it or get outrun by whoever does.",
    "customer": "Hippo",
    "gtmMotion": "Ride the Industry Inflection",
    "proofMetric": "Hippo partnered with Cognition to embed Devin across engineering, positioning to build and test across all 50 states without multiplying manual effort",
    "personaShift": {
      "CTO": "reframes capacity as intent, not headcount",
      "VPE": "makes speed the durable competitive advantage",
      "CFO": "frames the spend as defending market position",
      "CRO": "ties the deal to winning an industry inflection"
    }
  },
  {
    "tier": 2,
    "prompt": "We operate in a heavily regulated environment. Every line of code must be traceable, every change auditable, every release defensible to regulators.",
    "pattern": "Ride the Industry Inflection",
    "rootCause": "Regulation is the very constraint that makes disciplined, auditable agent workflows so valuable now.",
    "consequence": "Firms treating compliance as a blocker miss that it's exactly where agents create the most leverage.",
    "diagnostic": "Which regulated, well-bounded work — like specifications or audit docs — eats the most senior time you'd rather spend elsewhere?",
    "angle": "Sell into the regulatory moment: agents own the structured, auditable work (specs, DR plans, coverage evidence) while preserving the full audit trail regulators demand.",
    "objection": "Regulated work is the last place we'd trust an AI.",
    "reframe": "It's the best-suited place. The work is bounded and the standard is defined — the agent drafts to ~90% accuracy and your seniors become reviewers, where their regulatory judgment matters most, with the audit trail intact.",
    "customer": "Evinova",
    "gtmMotion": "Ride the Industry Inflection",
    "proofMetric": "Evinova cut GxP documentation from 35–40 hours to under 5 (8x faster) at ~90% first-draft accuracy, preserving the audit trail for 21 CFR Part 11",
    "personaShift": {
      "CTO": "makes regulated work a source of leverage, not drag",
      "VPE": "moves seniors from authoring to high-value review",
      "CFO": "reclaims 30+ senior hours per regulatory document",
      "CRO": "strengthens auditability and regulatory alignment"
    }
  },
  {
    "tier": 3,
    "prompt": "Software-defined vehicles change everything for us — cars that improve after they leave the factory. But safety-critical delivery is slow and review-heavy.",
    "pattern": "Ride the Industry Inflection",
    "rootCause": "A new product paradigm demands far faster, higher-quality delivery than legacy processes allow.",
    "consequence": "Teams that can't accelerate safely miss the window the new paradigm opens.",
    "diagnostic": "As you shift to software-defined vehicles, what has to get faster without ever lowering the safety bar?",
    "angle": "Sell the paradigm shift: autonomous agents triage issues, generate test coverage, and scan for regressions so engineers focus on the features that differentiate the vehicle.",
    "objection": "Moving faster in safety-critical software sounds reckless.",
    "reframe": "Speed and safety compound here. Agents add layers of QA — test generation, regression scans, triage — so you catch more, sooner. Engineers spend their time on features, not brute-force review, and quality goes up as velocity does.",
    "customer": "RV Tech (Rivian × Volkswagen)",
    "gtmMotion": "Ride the Industry Inflection",
    "proofMetric": "RV Tech redirected 3–4 engineers from triage back to product and lifted test-generation velocity 10x, targeting a platform that could reach 30M vehicles",
    "personaShift": {
      "CTO": "delivers on the software-defined-vehicle promise safely",
      "VPE": "adds QA layers while accelerating delivery",
      "CFO": "redirects scarce engineers to differentiating work",
      "CRO": "improves predictability and quality at the inflection"
    }
  },
  {
    "tier": 4,
    "prompt": "Most carriers spend the majority of their IT budget just maintaining legacy systems. Why would betting on agents now change our position?",
    "pattern": "Ride the Industry Inflection",
    "rootCause": "The status quo locks budget into maintenance, leaving nothing to capitalize on the shift.",
    "consequence": "Staying on legacy widens the gap as faster competitors compound their lead.",
    "diagnostic": "If you could redirect the budget currently trapped in legacy maintenance, what new products would you finally build?",
    "angle": "Sell the reallocation: embedding agents into the systems that run the business frees maintenance budget for the product and risk work that moves the needle.",
    "objection": "Betting on new technology mid-cycle feels riskier than staying put.",
    "reframe": "Staying put is the risk — the gap between fast and legacy carriers only widens from here. Owning your core tech and embedding agents lets you build and test across every state without multiplying effort, so intent, not headcount, sets your pace.",
    "customer": "Hippo",
    "gtmMotion": "Ride the Industry Inflection",
    "proofMetric": "Hippo builds and owns its core tech in-house; with Devin it can build and test across all 50 states without multiplying manual effort",
    "personaShift": {
      "CTO": "frees budget from maintenance for new capability",
      "VPE": "redirects effort from upkeep to product work",
      "CFO": "reallocates legacy run-cost into growth",
      "CRO": "closes the competitive gap instead of widening it"
    }
  },
  {
    "tier": 2,
    "prompt": "We're private-equity backed and competing hard. Our customers keep asking how we ship so much faster than the rest of the market.",
    "pattern": "Ride the Industry Inflection",
    "rootCause": "Competitive pressure at a market inflection rewards whoever can compound delivery speed the fastest.",
    "consequence": "Rivals that don't accelerate lose the innovation-pace narrative customers now judge them on.",
    "diagnostic": "How much of your competitive differentiation now comes down to raw pace of innovation?",
    "angle": "Sell speed as differentiation: embedding agents lets a mature org launch at startup cadence, and customers notice the pace.",
    "objection": "Enterprise-scale companies can't really move at startup speed.",
    "reframe": "They can when engineering stops being the constraint. Teams operating like a much larger org launched five products in three weeks — competitors literally called to ask what changed. Pace becomes the brand.",
    "customer": "Litera",
    "gtmMotion": "Ride the Industry Inflection",
    "proofMetric": "Litera launched 5 major products in 3 weeks ahead of its flagship event; CTO describes '250 engineers operating at the speed of a thousand'",
    "personaShift": {
      "CTO": "lets an enterprise org move at startup cadence",
      "VPE": "compounds delivery speed into a durable edge",
      "CFO": "turns pace into a PE-backed growth lever",
      "CRO": "makes innovation velocity a customer-facing differentiator"
    }
  },

  // ===================================================================
  // L6 — Productize into a Partner Offering: turn internal wins into a
  //      repeatable client/platform capability.
  // ===================================================================
  {
    "tier": 1,
    "prompt": "We've proven this internally. Now we want to build a repeatable client-facing practice around it — not just use it ourselves.",
    "pattern": "Productize into a Partner Offering",
    "rootCause": "Internal wins stay one-off unless they're packaged into a repeatable, sellable offering.",
    "consequence": "Without productizing, hard-won expertise never scales beyond your own four walls.",
    "diagnostic": "Which of your proven internal use cases could become a templated service you sell to clients?",
    "angle": "Wrap the proven methodology in advisory, enablement, customization, and ROI analytics — a full partner offering with the agent as the keystone.",
    "objection": "Reusing our internal approach with clients won't survive contact with their messy environments.",
    "reframe": "That's why you sell the methodology, not the environment. Each internal use case becomes a reusable playbook; the practice meets clients where they are — engineers, acceleration, or fully managed — all on the model you proved on yourself.",
    "customer": "AHEAD",
    "gtmMotion": "Productize into a Partner Offering",
    "proofMetric": "AHEAD built playbooks for Terraform, data models, Azure, Go, Salesforce/MuleSoft testing — the keystone of its AI-accelerated-development practice",
    "personaShift": {
      "CTO": "turns proven internal capability into a scalable practice",
      "VPE": "packages repeatable playbooks the team already validated",
      "CFO": "creates a new revenue line from existing expertise",
      "CRO": "sells a productized offering, not bespoke consulting"
    }
  },
  {
    "tier": 2,
    "prompt": "Every client engagement feels like starting from scratch. We can't scale a practice if each project reinvents the wheel.",
    "pattern": "Productize into a Partner Offering",
    "rootCause": "Bespoke, non-repeatable delivery caps how many clients a practice can serve.",
    "consequence": "Margins and growth stall because each engagement consumes senior time from zero.",
    "diagnostic": "Which delivery steps repeat across engagements often enough to template into a playbook?",
    "angle": "Convert each proven use case into a reusable playbook so every new engagement onboards faster than the last.",
    "objection": "Our clients' problems are too varied to templatize.",
    "reframe": "The problems vary; the motions repeat. Terraform upgrades, data-model evolution, test generation — template those as playbooks and each engagement starts from a proven asset, not a blank page.",
    "customer": "AHEAD",
    "gtmMotion": "Productize into a Partner Offering",
    "proofMetric": "AHEAD reports every new team onboards faster than the last as its library of reusable Devin playbooks grows",
    "personaShift": {
      "CTO": "standardizes delivery on proven, reusable assets",
      "VPE": "cuts ramp time on every new engagement",
      "CFO": "improves practice margins through repeatability",
      "CRO": "scales the number of clients a team can serve"
    }
  },
  {
    "tier": 3,
    "prompt": "Our clients don't just want technical fixes — they're solving business problems and want to see returns their board can act on.",
    "pattern": "Productize into a Partner Offering",
    "rootCause": "Buyers value outcomes and board-level ROI, not tooling for its own sake.",
    "consequence": "A practice that sells activity instead of outcomes struggles to justify its price to executives.",
    "diagnostic": "What returns would a client's board need to see to treat this as a strategic investment, not a line item?",
    "angle": "Bundle ROI analytics into the offering — measure the return in terms a board can act on — and meet clients wherever they are on the adoption curve.",
    "objection": "How do we prove business value, not just engineering output?",
    "reframe": "Instrument the outcome. Build ROI analytics into the engagement so returns land in board-ready terms; the agent handles the work while your practice reports the business impact clients actually buy.",
    "customer": "AHEAD",
    "gtmMotion": "Productize into a Partner Offering",
    "proofMetric": "AHEAD's offering pairs delivery with ROI analytics that measure returns 'in terms a board can act on,' force-multiplying client transformations",
    "personaShift": {
      "CTO": "connects technical work to strategic outcomes",
      "VPE": "delivers alongside clients with measurable impact",
      "CFO": "reports returns in board-ready ROI terms",
      "CRO": "sells business outcomes, elevating deal value"
    }
  },
  {
    "tier": 4,
    "prompt": "Some clients want us to run this as an ongoing managed service, but I worry we're just renting out capacity we can't differentiate.",
    "pattern": "Productize into a Partner Offering",
    "rootCause": "A managed service without a proven methodology is undifferentiated body-shopping.",
    "consequence": "Commoditized delivery competes only on price and erodes the practice's value.",
    "diagnostic": "What proven methodology and playbook library makes your managed service defensible versus a generic staffing shop?",
    "angle": "Differentiate the managed service on the methodology you proved on yourself and the playbook library behind it — capacity plus a repeatable, measured system.",
    "objection": "Isn't a managed service just reselling engineering hours?",
    "reframe": "Not when it's built on a methodology you proved internally and a growing playbook library. Clients aren't buying hours — they're buying a repeatable system with ROI analytics, which is exactly what a staffing shop can't offer.",
    "customer": "AHEAD",
    "gtmMotion": "Productize into a Partner Offering",
    "proofMetric": "A growing number of AHEAD clients now run Devin as an ongoing managed service, on the same methodology AHEAD proved on itself",
    "personaShift": {
      "CTO": "differentiates on methodology, not raw capacity",
      "VPE": "delivers a repeatable managed system, not ad-hoc hours",
      "CFO": "defends pricing with a proven, measured offering",
      "CRO": "moves the deal up-market from staffing to strategic partner"
    }
  },
  {
    "tier": 3,
    "prompt": "One of our engineers built a great agent workflow, but it's stuck on their team. How do we spread a single champion's win across the whole org?",
    "pattern": "Productize into a Partner Offering",
    "rootCause": "High-value workflows stay trapped with their author unless they're made portable.",
    "consequence": "Wins don't compound — each team keeps reinventing what a peer already solved.",
    "diagnostic": "Which of your best agent workflows could another squad run tomorrow with just a shared playbook and minimal config?",
    "angle": "Package a champion's workflow as a shareable playbook so any squad can replicate it against its own repos — turning one team's investment into a platform capability.",
    "objection": "Every team's setup is different, so workflows won't transfer.",
    "reframe": "The context differs, but the workflow is portable by design. One person invests the time to build the playbook with the right context; the whole org runs it with minimal config. A single champion's win becomes everyone's baseline.",
    "customer": "Evinova / RV Tech",
    "gtmMotion": "Productize into a Partner Offering",
    "proofMetric": "Evinova's AutoFixer and RV Tech's SIL playbook were built once and replicated across squads — one team's investment became a platform capability",
    "personaShift": {
      "CTO": "turns isolated wins into org-wide platform capability",
      "VPE": "lets every squad reuse a proven workflow, not rebuild it",
      "CFO": "amortizes one champion's effort across many teams",
      "CRO": "shows compounding, portable value across the account"
    }
  },
];
