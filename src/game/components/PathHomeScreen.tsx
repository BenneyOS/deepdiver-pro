import { useState } from "react";
import type { Seed, Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { SessionMode } from "../engine/session";
import { useSessionHistory } from "../store/useSessionHistory";
import { useProgressStore } from "../store/useProgressStore";
import { SessionHistory } from "./SessionHistory";
import { Ada } from "./Ada";

interface PathHomeScreenProps {
  seed: Seed;
  cardsSeen?: number;
  onStart: (mode: SessionMode, focusFamily?: Family) => void;
}

interface PathNode {
  family: Family;
  label: string;
  cleared: number;
  total: number;
  isCurrent: boolean;
}

export function PathHomeScreen({ seed, onStart }: PathHomeScreenProps) {
  const [showModes, setShowModes] = useState(false);
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);
  const { progressMap } = useProgressStore();
  const { sessions } = useSessionHistory();

  const families = Object.keys(seed.families) as Family[];

  const nodes: PathNode[] = families.map((fam) => {
    const familyCards = seed.cards.filter((c) => c.family === fam);
    const cleared = familyCards.filter((c) => {
      const p = progressMap.get(c.id);
      return p && p.box >= 3;
    }).length;

    return {
      family: fam,
      label: FAMILY_LABELS[fam],
      cleared,
      total: familyCards.length,
      isCurrent: false,
    };
  });

  // Find first non-cleared family as current
  const currentIdx = nodes.findIndex((n) => n.cleared < n.total);
  if (currentIdx >= 0) {
    nodes[currentIdx].isCurrent = true;
  }

  const totalCards = seed.cards.length;
  const totalCleared = nodes.reduce((sum, n) => sum + n.cleared, 0);

  // Streak from recent sessions
  const recentStreak = sessions.length;

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Header with Ada */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">
            Read the Room
          </h1>
          <p className="text-sm text-[var(--text-dim)]">
            Diagnostic selling, one card at a time
          </p>
        </div>
        <Ada expression={recentStreak >= 3 ? "pleased" : "neutral"} size={44} />
      </div>

      {/* Streak + progress header */}
      <div className="flex items-center justify-between rounded-2xl bg-[var(--card)] px-4 py-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">&#x1F525;</span>
          <span className="font-telemetry text-sm font-semibold text-[var(--accent)]">
            {recentStreak} {recentStreak === 1 ? "session" : "sessions"}
          </span>
        </div>
        <span className="font-telemetry text-sm text-[var(--text-dim)]">
          {totalCleared} of {totalCards} mastered
        </span>
      </div>

      {/* Winding path */}
      <div className="relative px-2">
        {nodes.map((node, i) => {
          const isCleared = node.cleared >= node.total;
          const isCurrent = node.isCurrent;
          const isLocked = !isCleared && !isCurrent && i > (currentIdx >= 0 ? currentIdx : 0);
          const pct = node.total > 0 ? Math.round((node.cleared / node.total) * 100) : 0;

          // Alternate left/right positioning
          const isLeft = i % 2 === 0;

          return (
            <div key={node.family} className="relative flex items-center gap-4 py-2">
              {/* Connector line */}
              {i > 0 && (
                <div
                  className="absolute left-[27px] -top-2 h-4 w-0.5"
                  style={{
                    backgroundColor: isCleared || isCurrent
                      ? "var(--accent)"
                      : "var(--card-2)",
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Node circle */}
              <button
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (isCurrent) {
                    setShowModes(true);
                  } else if (isCleared) {
                    onStart("family-focus", node.family);
                  }
                }}
                className={`relative flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                  ${isCurrent
                    ? "animate-node-bob border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] shadow-lg shadow-[var(--accent)]/20"
                    : isCleared
                      ? "border-[var(--success)] bg-[var(--success)]/20 text-[var(--success)]"
                      : "border-[var(--card-2)] bg-[var(--card)] text-[var(--text-faint)] cursor-not-allowed"
                  }
                  min-h-[44px]`}
                aria-label={`${node.label}: ${isCleared ? "cleared" : isCurrent ? "current" : "locked"}, ${pct}% mastered`}
              >
                {isCleared ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : isLocked ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="11" width="12" height="10" rx="2" />
                    <path d="M9 11V7a3 3 0 016 0v4" />
                  </svg>
                ) : (
                  <span className="font-extrabold text-sm">{node.family}</span>
                )}
              </button>

              {/* Label */}
              <div className={isLeft ? "" : ""}>
                <p className={`text-sm font-semibold ${
                  isCurrent ? "text-[var(--accent)]" : isCleared ? "text-[var(--text)]" : "text-[var(--text-faint)]"
                }`}>
                  {node.label}
                </p>
                <p className="font-telemetry text-xs text-[var(--text-faint)]">
                  {node.cleared}/{node.total} &middot; {pct}%
                </p>
                {isCurrent && (
                  <span className="mt-1 inline-block rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-bold text-[var(--accent-ink)]">
                    Start here
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mode selector overlay */}
      {showModes && (
        <div className="rounded-2xl bg-[var(--card)] p-4 shadow-xl animate-card-deal space-y-2">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
            Choose your drill
          </p>
          <ModeButton
            title="Quick Drill"
            description="7 cards \u2014 spaced repetition targets your weak spots"
            onClick={() => { setShowModes(false); onStart("quick-drill"); }}
          />
          <ModeButton
            title="Boss Deals"
            description="12 cards \u2014 weighted to tiers 3\u20134 (diagnostics & objections)"
            onClick={() => { setShowModes(false); onStart("boss-deals"); }}
          />
          <ModeButton
            title="Family Focus"
            description="7 cards \u2014 drill a single situation family"
            onClick={() => { setShowModes(false); setShowFamilyPicker(true); }}
          />
        </div>
      )}

      {/* Family picker */}
      {showFamilyPicker && (
        <div className="rounded-2xl bg-[var(--card)] p-4 shadow-xl animate-card-deal">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
            Choose a family
          </p>
          <div className="grid grid-cols-2 gap-2">
            {families.map((fam) => (
              <button
                key={fam}
                type="button"
                onClick={() => {
                  setShowFamilyPicker(false);
                  onStart("family-focus", fam);
                }}
                className="rounded-xl bg-[var(--card-2)] px-3 py-3 text-left transition-all hover:bg-[var(--card-2)]/80 min-h-[44px]"
                style={{ transitionTimingFunction: "var(--ease-standard)" }}
              >
                <span className="text-xs font-bold text-[var(--accent)]">{fam}.</span>{" "}
                <span className="text-xs text-[var(--text-dim)]">
                  {FAMILY_LABELS[fam]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Session history */}
      <SessionHistory sessions={sessions} />
    </div>
  );
}

function ModeButton({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-[var(--card-2)] p-4 text-left transition-all hover:bg-[var(--card-2)]/80 min-h-[44px]"
      style={{ transitionTimingFunction: "var(--ease-standard)" }}
    >
      <span className="font-bold text-[var(--text)]">{title}</span>
      <p className="mt-1 text-xs text-[var(--text-faint)]">{description}</p>
    </button>
  );
}
