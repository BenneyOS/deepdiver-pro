import { create } from "zustand";
import type { Card, Family, Persona } from "../../data/schema";

const STORAGE_KEY = "rtr_pitch_portfolio";

/**
 * A "winning pitch" the user has mastered. This is the Investment loop: a
 * growing collection of pitches the user owns, can review, and can share.
 * Captured the first time a card reaches mastery (Leitner box 5).
 */
export interface PitchEntry {
  cardId: string;
  family: Family;
  familyLabel: string;
  pattern: string;
  reframe: string;
  personaShift: Record<Persona, string>;
  masteredAt: string;
}

function loadPitches(): PitchEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PitchEntry[]) : [];
  } catch {
    return [];
  }
}

function savePitches(pitches: PitchEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pitches));
  } catch {
    // storage unavailable; in-memory state is still correct
  }
}

interface PortfolioState {
  pitches: PitchEntry[];
  /** Idempotent: adds the card's pitch once (keyed by cardId). */
  capture: (card: Card, familyLabel: string) => boolean;
  has: (cardId: string) => boolean;
}

export const usePortfolio = create<PortfolioState>((set, get) => ({
  pitches: loadPitches(),

  capture: (card, familyLabel) => {
    if (get().pitches.some((p) => p.cardId === card.id)) return false;
    const entry: PitchEntry = {
      cardId: card.id,
      family: card.family,
      familyLabel,
      pattern: card.pattern,
      reframe: card.reframe,
      personaShift: card.personaShift,
      masteredAt: new Date().toISOString(),
    };
    const updated = [entry, ...get().pitches];
    savePitches(updated);
    set({ pitches: updated });
    return true;
  },

  has: (cardId) => get().pitches.some((p) => p.cardId === cardId),
}));

/** Plain-text share body for a mastered pitch (clipboard / share sheet). */
export function pitchShareText(p: PitchEntry): string {
  const personas = (Object.keys(p.personaShift) as Persona[])
    .map((k) => `${k}: ${p.personaShift[k]}`)
    .join("\n");
  return [
    `${p.pattern}`,
    ``,
    `The reframe: ${p.reframe}`,
    ``,
    `How it lands by persona:`,
    personas,
    ``,
    `— mastered in Read the Room (${p.familyLabel})`,
  ].join("\n");
}
