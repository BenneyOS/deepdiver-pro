import { create } from "zustand";

const STORAGE_KEY = "rtr_streak";

/**
 * Daily play streak with a single protective "freeze" so one missed day
 * doesn't reset progress to zero (anti-rage-quit). A freeze is consumed
 * automatically when exactly one day was skipped; longer gaps reset.
 */
export interface StreakState {
  count: number;
  lastPlayedDay: string | null; // YYYY-MM-DD
  freezes: number;
  atRisk: boolean; // played yesterday but not today
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function dayNumber(iso: string): number {
  return Math.floor(new Date(iso + "T00:00:00Z").getTime() / 86400000);
}

function load(): Omit<StreakState, "atRisk"> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Omit<StreakState, "atRisk">;
  } catch {
    // fall through
  }
  return { count: 0, lastPlayedDay: null, freezes: 1 };
}

function save(s: Omit<StreakState, "atRisk">): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // storage unavailable
  }
}

function computeAtRisk(lastPlayedDay: string | null): boolean {
  if (!lastPlayedDay) return false;
  const gap = dayNumber(today()) - dayNumber(lastPlayedDay);
  return gap >= 1;
}

interface StreakStore extends StreakState {
  /** Call when the user completes a session; advances or protects the streak. */
  recordPlay: () => void;
}

export const useStreak = create<StreakStore>((set, get) => {
  const initial = load();
  return {
    ...initial,
    atRisk: computeAtRisk(initial.lastPlayedDay),

    recordPlay: () => {
      const s = get();
      const day = today();
      if (s.lastPlayedDay === day) return; // already counted today

      let count = s.count;
      let freezes = s.freezes;
      const gap = s.lastPlayedDay ? dayNumber(day) - dayNumber(s.lastPlayedDay) : Infinity;

      if (gap === 1 || s.lastPlayedDay === null) {
        count = count + 1;
      } else if (gap === 2 && freezes > 0) {
        // One missed day, protected by a freeze — streak survives and grows.
        freezes -= 1;
        count = count + 1;
      } else {
        // Longer gap — reset, but replenish the freeze for the new run.
        count = 1;
        freezes = 1;
      }

      const next = { count, lastPlayedDay: day, freezes };
      save(next);
      set({ ...next, atRisk: false });
    },
  };
});
