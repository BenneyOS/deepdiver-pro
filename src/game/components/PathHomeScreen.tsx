import { useState } from "react";
import type { Seed, Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { SessionMode } from "../engine/session";
import { useSessionHistory } from "../store/useSessionHistory";
import { useProgressStore } from "../store/useProgressStore";
import { SessionHistory } from "./SessionHistory";
import { Ada } from "./Ada";

const UNLOCK_THRESHOLD = 4;

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

  const currentIdx = nodes.findIndex((n) => n.cleared < n.total);
  if (currentIdx >= 0) {
    nodes[currentIdx].isCurrent = true;
  }

  const totalCards = seed.cards.length;
  const totalCleared = nodes.reduce((sum, n) => sum + n.cleared, 0);
  const masteryPct = totalCards > 0 ? Math.round((totalCleared / totalCards) * 100) : 0;
  const recentStreak = sessions.length;

  function handleQuickStart() {
    onStart("quick-drill");
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-5">
      {/* Header with Ada */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)]">
            Read the Room
          </h1>
          <p className="text-sm text-[var(--text-dim)]">
            Diagnostic selling, one card at a time
          </p>
        </div>
        <Ada expression={recentStreak >= 3 ? "pleased" : "neutral"} size={44} />
      </div>

      {/* FIX 1: Primary CTA — above the fold, immediately visible */}
      <button
        type="button"
        onClick={handleQuickStart}
        className="w-full rounded-2xl bg-[var(--ink)] py-4 text-center font-bold text-white transition-all active:scale-[0.97] min-h-[44px] animate-card-deal"
        style={{ transitionTimingFunction: "var(--ease-spring)" }}
        aria-label="Continue — start Quick Drill"
      >
        Continue
      </button>

      {/* Streak + mastery header */}
      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
        {recentStreak > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-bg)] px-2.5 py-1 text-xs font-bold text-[var(--accent-ink)]">
              <span aria-hidden="true">&#x1F525;</span>
              {recentStreak}
            </span>
          </div>
        )}
        {/* Mastery bar — lifetime progress */}
        <div className="flex-1 ml-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-dim)]">Mastery</span>
            <span className="font-telemetry font-semibold text-[var(--ink)]">{totalCleared} of {totalCards}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mode shortcuts */}
      <div className="flex gap-2">
        <ModeChip label="Quick Drill" active onClick={() => onStart("quick-drill")} />
        <ModeChip label="Boss Deals" onClick={() => onStart("boss-deals")} />
        <ModeChip label="Family Focus" onClick={() => setShowFamilyPicker(true)} />
      </div>

      {/* Family picker */}
      {showFamilyPicker && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 animate-card-deal">
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
                className="rounded-xl border border-[var(--border)] bg-[var(--card-2)] px-3 py-3 text-left transition-all hover:border-[var(--accent)] active:scale-[0.97] min-h-[44px]"
                style={{ transitionTimingFunction: "var(--ease-standard)" }}
              >
                <span className="text-xs font-bold text-[var(--accent-ink)]">{fam}.</span>{" "}
                <span className="text-xs text-[var(--text-dim)]">
                  {FAMILY_LABELS[fam]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Winding path */}
      <div className="relative px-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
          Your path
        </p>
        {nodes.map((node, i) => {
          const isCleared = node.cleared >= node.total;
          const isCurrent = node.isCurrent;
          const isLocked = !isCleared && !isCurrent && i > (currentIdx >= 0 ? currentIdx : 0);
          const pct = node.total > 0 ? Math.round((node.cleared / node.total) * 100) : 0;

          // FIX 4: Determine unlock condition for locked nodes
          const prevNode = i > 0 ? nodes[i - 1] : null;
          const unlockText = isLocked && prevNode
            ? `Clear ${UNLOCK_THRESHOLD} in ${prevNode.label} to unlock`
            : null;

          return (
            <div key={node.family} className="relative flex items-center gap-4 py-2">
              {/* Connector line */}
              {i > 0 && (
                <div
                  className="absolute left-[27px] -top-2 h-4 w-0.5"
                  style={{
                    backgroundColor: isCleared || isCurrent
                      ? "var(--accent)"
                      : "var(--border)",
                  }}
                  aria-hidden="true"
                />
              )}

              {/* FIX 1: Node circle — current node is tappable and launches round */}
              <button
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (isCurrent) {
                    onStart("quick-drill");
                  } else if (isCleared) {
                    onStart("family-focus", node.family);
                  }
                }}
                className={`relative flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                  ${isCurrent
                    ? "animate-node-bob border-[var(--accent)] bg-[var(--accent)] text-[var(--ink)] shadow-md active:scale-[0.93] cursor-pointer"
                    : isCleared
                      ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)] cursor-pointer active:scale-[0.95]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--text-faint)] cursor-not-allowed opacity-60"
                  }
                  min-h-[44px]`}
                aria-label={`${node.label}: ${isCleared ? "cleared" : isCurrent ? "current — tap to start" : "locked"}, ${pct}% mastered`}
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

              {/* Label + progress / unlock condition */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  isCurrent ? "text-[var(--ink)]" : isCleared ? "text-[var(--ink)]" : "text-[var(--text-faint)]"
                }`}>
                  {node.label}
                </p>
                {/* FIX 4: Current unit shows progress toward threshold */}
                {isCurrent && (
                  <p className="font-telemetry text-xs text-[var(--text-dim)]">
                    {node.cleared} of {node.total} cleared &middot; {pct}%
                  </p>
                )}
                {isCleared && (
                  <p className="font-telemetry text-xs text-[var(--success)]">
                    Cleared
                  </p>
                )}
                {/* FIX 4: Locked unit states unlock condition in plain language */}
                {isLocked && unlockText && (
                  <p className="text-xs text-[var(--text-faint)]">
                    {unlockText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Session history */}
      <SessionHistory sessions={sessions} />
    </div>
  );
}

function ModeChip({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition-all active:scale-[0.95] min-h-[44px]
        ${active
          ? "border-[var(--ink)] bg-[var(--ink)] text-white"
          : "border-[var(--border)] bg-[var(--page)] text-[var(--text-dim)] hover:border-[var(--text-dim)]"
        }`}
      style={{ transitionTimingFunction: "var(--ease-standard)" }}
    >
      {label}
    </button>
  );
}
