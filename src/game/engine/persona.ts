// Persona lens. The reveal used to show a single vague phrase per stakeholder
// (e.g. CTO: "de-risks the modernization roadmap"), which made it hard to see
// WHY the same situation lands differently for a CFO vs a CTO vs a VPE.
//
// This derives a richer, consistent lens for each persona from data already on
// the card (its per-persona value phrase) plus a fixed map of what each role
// fundamentally optimises for. No per-card authoring required — it's generated,
// so it applies uniformly across the whole deck.
import type { Card, Persona } from "../../data/schema";

export interface PersonaLens {
  persona: Persona;
  /** Full role title, e.g. "Chief Financial Officer". */
  title: string;
  /** What this role fundamentally weighs decisions against. */
  cares: string;
  /** Why this same situation lands the way it does for them. */
  why: string;
  /** A quotable line to actually say to this stakeholder. */
  say: string;
}

interface PersonaMeta {
  title: string;
  cares: string;
}

// What each stakeholder optimises for — the reason the identical fact has to be
// reframed per role. Kept deliberately distinct so the four lenses never blur.
const PERSONA_META: Record<Persona, PersonaMeta> = {
  CTO: {
    title: "Chief Technology Officer",
    cares: "technical risk, architecture longevity, and engineering leverage",
  },
  VPE: {
    title: "VP of Engineering",
    cares: "delivery velocity, team focus, and operational load",
  },
  CFO: {
    title: "Chief Financial Officer",
    cares: "cost, ROI, and predictable spend",
  },
  CRO: {
    title: "Chief Risk Officer",
    cares: "compliance, continuity, and downside exposure",
  },
};

/** Lower-case a phrase's first letter so it reads mid-sentence. */
function lowerFirst(s: string): string {
  return s.length ? s[0].toLowerCase() + s.slice(1) : s;
}

/** Upper-case a phrase's first letter so it reads as a standalone line. */
function upperFirst(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

export function personaLens(card: Card, persona: Persona): PersonaLens {
  const meta = PERSONA_META[persona];
  const shift = card.personaShift[persona].trim().replace(/\.+$/, "");
  return {
    persona,
    title: meta.title,
    cares: meta.cares,
    why: `A ${meta.title} weighs this against ${meta.cares}. Seen through that lens it ${lowerFirst(
      shift,
    )} — so that's the thread to pull with them.`,
    say: `${upperFirst(shift)} — that's what this means for you specifically.`,
  };
}

export function allPersonaLenses(card: Card): PersonaLens[] {
  return (Object.keys(PERSONA_META) as Persona[]).map((p) => personaLens(card, p));
}
