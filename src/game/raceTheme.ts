// Diagnostic Grand Prix — display-only theming layer.
//
// This maps the engine's existing (untouched) sales concepts onto the racing
// skin described in RESKIN_PRD.md. Nothing here changes game logic, scoring,
// progression, or content — it only renames things for the UI. The engine
// still speaks "ranks", "points", and "modes"; we translate at the edge.

import type { Rank } from "./engine/scoring";
import type { SessionMode } from "./engine/session";

/** Sales rank → racing tier (Rookie → Pro → Contender → Champion → Legend). */
const RANK_TO_TIER: Record<Rank, string> = {
  Prospect: "Rookie",
  SDR: "Pro",
  "Account Exec": "Contender",
  "Senior Seller": "Champion",
  "Diagnostic Closer": "Legend",
};

export function racingTier(rank: Rank): string {
  return RANK_TO_TIER[rank] ?? "Rookie";
}

/** Session mode → race name shown to the player. */
const MODE_TO_RACE: Record<SessionMode, string> = {
  lesson: "Race",
  "quick-drill": "Practice Lap",
  "speed-round": "Time Trial",
  "boss-deals": "Championship Cup",
  "objection-volley": "Versus",
  "match-pairs": "Match Pairs",
  "family-focus": "Circuit Focus",
};

export function raceName(mode: SessionMode): string {
  return MODE_TO_RACE[mode] ?? "Race";
}
