import { create } from "zustand";
import type { CardProgress } from "../../data/schema";

const DB_NAME = "readtheroom";
const STORE_NAME = "progress";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "cardId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadAllProgress(): Promise<CardProgress[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as CardProgress[]);
    req.onerror = () => reject(req.error);
  });
}

async function saveProgress(progress: CardProgress): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(progress);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

interface ProgressState {
  progressMap: Map<string, CardProgress>;
  initialized: boolean;
  hydrate: () => Promise<void>;
  updateCard: (progress: CardProgress) => Promise<void>;
  getProgress: (cardId: string) => CardProgress | undefined;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressMap: new Map(),
  initialized: false,

  hydrate: async () => {
    try {
      const all = await loadAllProgress();
      const map = new Map<string, CardProgress>();
      for (const p of all) {
        map.set(p.cardId, p);
      }
      set({ progressMap: map, initialized: true });
    } catch {
      set({ initialized: true });
    }
  },

  updateCard: async (progress: CardProgress) => {
    const map = new Map(get().progressMap);
    map.set(progress.cardId, progress);
    set({ progressMap: map });
    try {
      await saveProgress(progress);
    } catch {
      // IndexedDB write failed; in-memory state is still correct
    }
  },

  getProgress: (cardId: string) => {
    return get().progressMap.get(cardId);
  },
}));
