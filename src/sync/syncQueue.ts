import type { CardProgress } from "../data/schema";
import { syncProgress, fetchProgress, isAuthenticated } from "./api";

const QUEUE_KEY = "rtr_sync_queue";

interface SyncDelta {
  cardId: string;
  box: number;
  seen: number;
  hit: number;
  lastAttemptAt: string;
}

function loadQueue(): SyncDelta[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as SyncDelta[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncDelta[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueDelta(progress: CardProgress): void {
  const queue = loadQueue();
  const existing = queue.findIndex((d) => d.cardId === progress.cardId);
  const delta: SyncDelta = {
    cardId: progress.cardId,
    box: progress.box,
    seen: progress.seen,
    hit: progress.hit,
    lastAttemptAt: progress.lastAttemptAt ?? new Date().toISOString(),
  };

  if (existing >= 0) {
    queue[existing] = delta;
  } else {
    queue.push(delta);
  }
  saveQueue(queue);
}

export async function flushQueue(): Promise<void> {
  if (!isAuthenticated()) return;

  const queue = loadQueue();
  if (queue.length === 0) return;

  try {
    await syncProgress(queue);
    saveQueue([]);
  } catch {
    // Queue persists for next attempt
  }
}

export async function pullAndMerge(
  localMap: Map<string, CardProgress>,
  updateFn: (progress: CardProgress) => Promise<void>,
): Promise<void> {
  if (!isAuthenticated()) return;

  try {
    const { progress } = await fetchProgress();

    for (const server of progress) {
      const local = localMap.get(server.cardId);

      // Server wins on conflict: higher box + latest timestamp
      if (!local) {
        await updateFn({
          cardId: server.cardId,
          box: server.box,
          seen: server.seen,
          hit: server.hit,
          nextDueAt: server.nextDueAt ?? undefined,
          lastAttemptAt: server.lastAttemptAt ?? undefined,
        });
      } else {
        const serverTime = server.lastAttemptAt
          ? new Date(server.lastAttemptAt).getTime()
          : 0;
        const localTime = local.lastAttemptAt
          ? new Date(local.lastAttemptAt).getTime()
          : 0;

        const merged: CardProgress = {
          cardId: server.cardId,
          box: Math.max(local.box, server.box),
          seen: Math.max(local.seen, server.seen),
          hit: Math.max(local.hit, server.hit),
          lastAttemptAt:
            serverTime > localTime
              ? (server.lastAttemptAt ?? undefined)
              : local.lastAttemptAt,
        };
        await updateFn(merged);
      }
    }
  } catch {
    // Offline or error; local state remains
  }
}
