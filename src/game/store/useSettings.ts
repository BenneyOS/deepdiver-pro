import { create } from "zustand";

const STORAGE_KEY = "rtr_settings";

export interface Settings {
  haptics: boolean;
  sound: boolean;
}

const DEFAULTS: Settings = { haptics: true, sound: true };

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // storage unavailable; in-memory state is still correct
  }
}

interface SettingsState extends Settings {
  toggleHaptics: () => void;
  toggleSound: () => void;
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...loadSettings(),

  toggleHaptics: () => {
    const next = { haptics: !get().haptics, sound: get().sound };
    saveSettings(next);
    set({ haptics: next.haptics });
  },

  toggleSound: () => {
    const next = { haptics: get().haptics, sound: !get().sound };
    saveSettings(next);
    set({ sound: next.sound });
  },
}));
