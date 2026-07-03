import { create } from "zustand";
import type { SessionRecord } from "../components/SessionHistory";

const STORAGE_KEY = "rtr_session_history";

function loadSessions(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: SessionRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

interface SessionHistoryState {
  sessions: SessionRecord[];
  addSession: (session: Omit<SessionRecord, "id" | "createdAt">) => void;
}

export const useSessionHistory = create<SessionHistoryState>((set, get) => ({
  sessions: loadSessions(),

  addSession: (session) => {
    const record: SessionRecord = {
      ...session,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [record, ...get().sessions].slice(0, 50);
    saveSessions(updated);
    set({ sessions: updated });
  },
}));
