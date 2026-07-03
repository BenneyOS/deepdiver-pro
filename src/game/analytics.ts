import type { Family, Tier } from "../data/schema";
import type { Wager } from "./engine/scoring";
import type { SessionMode } from "./engine/session";

type AnalyticsEvent =
  | { event: "session_started"; properties: { mode: SessionMode; focusFamily?: string } }
  | { event: "round_completed"; properties: { cardId: string; family: Family; tier: Tier; correct: boolean; wager: Wager; points: number } }
  | { event: "session_completed"; properties: { mode: SessionMode; score: number; hits: number; total: number; maxStreak: number; accuracy: number } }
  | { event: "card_shared"; properties: { grade: string; accuracy: number } }
  | { event: "family_focus_selected"; properties: { family: Family } }
  | { event: "pwa_installed"; properties: Record<string, never> };

const EVENT_QUEUE_KEY = "rtr_analytics_queue";

function getQueue(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(EVENT_QUEUE_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: AnalyticsEvent[]): void {
  localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify(queue.slice(-500)));
}

export function trackEvent(event: AnalyticsEvent): void {
  // If PostHog is loaded, send directly
  const posthog = (globalThis as Record<string, unknown>).posthog as
    | { capture: (event: string, properties: Record<string, unknown>) => void }
    | undefined;

  if (posthog?.capture) {
    posthog.capture(event.event, event.properties);
    return;
  }

  // Queue for later flush
  const queue = getQueue();
  queue.push(event);
  saveQueue(queue);
}

export function flushAnalyticsQueue(): void {
  const posthog = (globalThis as Record<string, unknown>).posthog as
    | { capture: (event: string, properties: Record<string, unknown>) => void }
    | undefined;

  if (!posthog?.capture) return;

  const queue = getQueue();
  for (const event of queue) {
    posthog.capture(event.event, event.properties);
  }
  localStorage.removeItem(EVENT_QUEUE_KEY);
}
