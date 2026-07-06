import { create } from "zustand";
import {
  starsForAccuracy,
  type CompletedLessons,
  type LessonRecord,
  type Stars,
} from "../engine/curriculum";

const STORAGE_KEY = "rtr_curriculum";

function load(): CompletedLessons {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompletedLessons) : {};
  } catch {
    return {};
  }
}

function save(c: CompletedLessons): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  } catch {
    // storage unavailable; in-memory state is still correct
  }
}

interface CurriculumState {
  completed: CompletedLessons;
  /** Complete a lesson (idempotent). Keeps the best star rating on replay. */
  completeLesson: (lessonId: string, hits: number, total: number) => Stars;
  isComplete: (lessonId: string) => boolean;
  stars: (lessonId: string) => Stars;
  reset: () => void;
}

export const useCurriculum = create<CurriculumState>((set, get) => ({
  completed: load(),

  completeLesson: (lessonId, hits, total) => {
    const earned = starsForAccuracy(hits, total);
    const prev = get().completed[lessonId];
    const bestStars = (Math.max(prev?.stars ?? 0, earned) as Stars);
    const record: LessonRecord = {
      stars: bestStars,
      completedAt: new Date().toISOString(),
    };
    const updated = { ...get().completed, [lessonId]: record };
    save(updated);
    set({ completed: updated });
    return earned;
  },

  isComplete: (lessonId) => Boolean(get().completed[lessonId]),
  stars: (lessonId) => get().completed[lessonId]?.stars ?? 0,

  reset: () => {
    save({});
    set({ completed: {} });
  },
}));
