import { useState } from "react";
import type { Seed, Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { SessionMode } from "../engine/session";
import {
  isMastered,
  clearedInFamily,
  totalMastered,
  unlockThresholdFor,
} from "../engine/progress";
import { useSessionHistory } from "../store/useSessionHistory";
import { useProgressStore } from "../store/useProgressStore";
import { usePortfolio } from "../store/usePortfolio";
import { useSettings } from "../store/useSettings";
import { useStreak } from "../store/useStreak";
import { SessionHistory } from "./SessionHistory";
import { Ada } from "./Ada";

interface PathHomeScreenProps {
  seed: Seed;
  cardsSeen?: number;
  onStart: (mode: SessionMode, focusFamily?: Family) => void;
  onOpenPortfolio: () => void;
}

interface PathNode {
  family: Family;
  label: string;
  cleared: number;
  mastered: number;
  total: number;
  threshold: number;
  isCurrent: boolean;
  isUnlocked: boolean;
}

export function PathHomeScreen({ seed, onStart, onOpenPortfolio }: PathHomeScreenProps) {
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);
  const { progressMap } = useProgressStore();
  const { sessions } = useSessionHistory();
  const portfolioCount = usePortfolio((s) => s.pitches.length);
  const { haptics, sound, toggleHaptics, toggleSound } = useSettings();

  const families = Object.keys(seed.families) as Family[];

  const nodes: PathNode[] = families.map((fam, i) => {
    const familyCards = seed.cards.filter((c) => c.family === fam);
    const cleared = clearedInFamily(seed.cards, progressMap, fam);
    const mastered = familyCards.filter((c) => isMastered(progressMap.get(c.id))).length;
    const total = familyCards.length;

    // Unit unlocks when the previous unit has cleared its threshold.
    let isUnlocked = true;
    if (i > 0) {
      const prev = families[i - 1];
      const prevTotal = seed.cards.filter((c) => c.family === prev).length;
      isUnlocked = clearedInFamily(seed.cards, progressMap, prev) >= unlockThresholdFor(prevTotal);
    }

    return {
      family: fam,
      label: FAMILY_LABELS[fam],
      cleared,
      mastered,
      total,
      threshold: unlockThresholdFor(total),
      isCurrent: false,
      isUnlocked,
    };
  });

  // Current = first unlocked, not-yet-fully-cleared unit.
  const currentIdx = nodes.findIndex((n) => n.isUnlocked && n.cleared < n.total);
  if (currentIdx >= 0) {
    nodes[currentIdx].isCurrent = true;
  }

  const totalCards = seed.cards.length;
  const totalMasteredCount = totalMastered(seed.cards, progressMap);
  const masteryPct = totalCards > 0 ? Math.round((totalMasteredCount / totalCards) * 100) : 0;

  const { count: dayStreak, atRisk, freezes } = useStreak();
  const currentNode = currentIdx >= 0 ? nodes[currentIdx] : null;

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
            Become the seller who reads any room
          </p>
        </div>
        <Ada expression={dayStreak >= 3 ? "pleased" : "neutral"} size={44} />
      </div>

      {/* FIX 1: Primary CTA — above the fold, immediately visible */}
      <button
        type="button"
        onClick={handleQuickStart}
        className="w-full rounded-2xl bg-[var(--accent)] py-4 text-center font-bold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.97] min-h-[44px] animate-card-deal"
        style={{ transitionTimingFunction: "var(--ease-spring)" }}
        aria-label="Continue — start Quick Drill"
      >
        Continue
      </button>

      {/* Contextual trigger — personalized to the unit you're mid-progress on */}
      {currentNode && (
        <button
          type="button"
          onClick={() => onStart("family-focus", currentNode.family)}
          className="flex w-full items-center gap-3 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent-bg)] px-4 py-3 text-left transition-all hover:border-[var(--accent)] active:scale-[0.98] min-h-[44px]"
          style={{ transitionTimingFunction: "var(--ease-standard)" }}
        >
          <Ada expression="thinking" size={32} />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-ink)]">
              Today&rsquo;s read
            </p>
            <p className="text-sm font-semibold leading-snug text-[var(--ink)]">
              Ready to close the {currentNode.label} objection?
            </p>
          </div>
        </button>
      )}

      {/* Streak — with a protective freeze so one missed day doesn't reset it */}
      {dayStreak > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--streak)]">
            <span aria-hidden="true">&#x1F525;</span>
            {dayStreak}-day streak
          </span>
          <span className="text-xs text-[var(--text-dim)]">
            {atRisk
              ? freezes > 0
                ? "At risk — a freeze has you covered"
                : "At risk — play today to keep it"
              : freezes > 0
                ? "1 freeze banked"
                : "Locked in"}
          </span>
        </div>
      )}

      {/* Mastered header — lifetime progress (Leitner box 5) */}
      <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-dim)]">Mastered</span>
            <span className="font-telemetry font-semibold text-[var(--ink)]">{totalMasteredCount} of {totalCards}</span>
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
      <div className="grid grid-cols-2 gap-2">
        <ModeChip label="Quick Drill" active onClick={() => onStart("quick-drill")} />
        <ModeChip label="Speed Round" onClick={() => onStart("speed-round")} />
        <ModeChip label="Boss Deals" onClick={() => onStart("boss-deals")} />
        <ModeChip label="Objection Volley" onClick={() => onStart("objection-volley")} />
        <ModeChip label="Match Pairs" onClick={() => onStart("match-pairs")} />
        <ModeChip label="Family Focus" onClick={() => setShowFamilyPicker(true)} />
      </div>

      {/* Pitch Portfolio — the Investment loop */}
      <button
        type="button"
        onClick={onOpenPortfolio}
        className="flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left transition-all hover:border-[var(--accent)] active:scale-[0.98] min-h-[44px]"
        style={{ transitionTimingFunction: "var(--ease-standard)" }}
      >
        <div>
          <p className="text-sm font-bold text-[var(--ink)]">Pitch Portfolio</p>
          <p className="text-xs text-[var(--text-dim)]">
            The reads you&rsquo;ve mastered, yours to keep &amp; share
          </p>
        </div>
        <span className="ml-3 shrink-0 rounded-full bg-[var(--accent-bg)] px-2.5 py-1 text-xs font-telemetry font-bold text-[var(--accent-ink)]">
          {portfolioCount}
        </span>
      </button>

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
          const isCleared = node.total > 0 && node.cleared >= node.total;
          const isCurrent = node.isCurrent;
          const isLocked = !node.isUnlocked;

          // FIX 4: Determine unlock condition for locked nodes
          const prevNode = i > 0 ? nodes[i - 1] : null;
          const unlockText = isLocked && prevNode
            ? `Clear ${prevNode.threshold} in ${prevNode.label} to unlock`
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
                  if (isCurrent || isCleared) {
                    onStart("family-focus", node.family);
                  }
                }}
                className={`relative flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                  ${isCurrent
                    ? "animate-node-bob border-[var(--accent-strong)] bg-[var(--accent-strong)] text-[var(--ink)] shadow-md active:scale-[0.93] cursor-pointer"
                    : isCleared
                      ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)] cursor-pointer active:scale-[0.95]"
                      : "border-[var(--border)] bg-[var(--card)] text-[var(--text-faint)] cursor-not-allowed opacity-60"
                  }
                  min-h-[44px]`}
                aria-label={`${node.label}: ${isCleared ? "cleared" : isCurrent ? "current — tap to start" : "locked"}, ${node.cleared} of ${node.total} cleared`}
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
                    {node.cleared} of {node.total} cleared
                    {node.mastered > 0 && ` · ${node.mastered} mastered`}
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

      {/* Feedback settings */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <SettingToggle
          label="Haptics"
          on={haptics}
          onToggle={toggleHaptics}
        />
        <SettingToggle
          label="Sound"
          on={sound}
          onToggle={toggleSound}
        />
      </div>
    </div>
  );
}

function SettingToggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors min-h-[36px] ${
        on
          ? "border-[var(--accent)] bg-[var(--accent-bg)] text-[var(--accent-ink)]"
          : "border-[var(--border)] bg-[var(--card)] text-[var(--text-faint)]"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${on ? "bg-[var(--accent)]" : "bg-[var(--text-faint)]"}`}
        aria-hidden="true"
      />
      {label} {on ? "on" : "off"}
    </button>
  );
}

function ModeChip({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition-all active:scale-[0.95] min-h-[44px]
        ${active
          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
          : "border-[var(--border)] bg-[var(--page)] text-[var(--text-dim)] hover:border-[var(--text-dim)]"
        }`}
      style={{ transitionTimingFunction: "var(--ease-standard)" }}
    >
      {label}
    </button>
  );
}
