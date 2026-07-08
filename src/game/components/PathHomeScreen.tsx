import { useEffect, useRef, useState } from "react";
import type { Seed, Family } from "../../data/schema";
import { FAMILY_LABELS, FAMILY_ICONS } from "../../data/schema";
import type { SessionMode } from "../engine/session";
import {
  allLessons,
  unitState,
  isUnitUnlocked,
  focusedUnitIndex,
  nextLessonInUnit,
  FEATURED_FAMILY,
  type UnitState,
  type LessonRef,
} from "../engine/curriculum";
import { useSessionHistory } from "../store/useSessionHistory";
import { useCurriculum } from "../store/useCurriculum";
import { useSettings } from "../store/useSettings";
import { useStreak } from "../store/useStreak";
import { SessionHistory } from "./SessionHistory";
import { Ada } from "./Ada";

interface PathHomeScreenProps {
  seed: Seed;
  onStart: (mode: SessionMode, focusFamily?: Family) => void;
  onStartLesson: (lessonId: string) => void;
}

interface PathNode {
  unit: UnitState;
  label: string;
  isCurrent: boolean;
  isUnlocked: boolean;
  nextLesson: LessonRef | null;
}

export function PathHomeScreen({
  seed,
  onStart,
  onStartLesson,
}: PathHomeScreenProps) {
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const { sessions } = useSessionHistory();
  const completed = useCurriculum((s) => s.completed);
  const { haptics, sound, toggleHaptics, toggleSound } = useSettings();
  const { count: dayStreak } = useStreak();

  const families = Object.keys(seed.families) as Family[];
  // The unit the hero ring focuses on. Follows the player down the path (deepest
  // engaged, not-yet-mastered unit) instead of freezing on the first incomplete
  // unit until it's 100% mastered.
  const currentIdx = focusedUnitIndex(seed.cards, families, completed);

  const nodes: PathNode[] = families.map((fam, i) => {
    const unit = unitState(seed.cards, fam, completed);
    return {
      unit,
      label: FAMILY_LABELS[fam],
      isCurrent: i === currentIdx,
      isUnlocked: isUnitUnlocked(seed.cards, families, i, completed),
      nextLesson: nextLessonInUnit(seed.cards, fam, completed),
    };
  });

  // Path lessons, used only to fall back to the very first lesson when the whole
  // curriculum is finished. unitsUnlocked drives the one-time unlock toast.
  const lessons = allLessons(seed.cards, families);
  // Only the linear ladder (excluding the always-on featured unit) drives the
  // "new unit unlocked" toast, so the featured unit never mis-fires it.
  const pathUnlocked = families.reduce(
    (n, fam, i) =>
      fam !== FEATURED_FAMILY && isUnitUnlocked(seed.cards, families, i, completed)
        ? n + 1
        : n,
    0,
  );

  // The featured Case Files unit — surfaced in its own card at the top of Home,
  // always playable, and kept out of the linear path below.
  const caseFilesUnit = families.includes(FEATURED_FAMILY)
    ? unitState(seed.cards, FEATURED_FAMILY, completed)
    : null;
  const caseFilesNext = caseFilesUnit
    ? nextLessonInUnit(seed.cards, FEATURED_FAMILY, completed)
    : null;
  const handleCaseFiles = () => {
    const target = caseFilesNext ?? caseFilesUnit?.lessons[0] ?? null;
    if (target) onStartLesson(target.id);
  };

  // Fire a one-time "Unlocked!" toast when a new unit becomes playable. Baseline
  // is 1 (Unit A is always unlocked), persisted so it only fires once per unlock.
  const [unlockToast, setUnlockToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  useEffect(() => {
    const KEY = "rtr_seen_unlocked";
    let prev = 1;
    try {
      prev = Number(localStorage.getItem(KEY) ?? "1") || 1;
    } catch {
      prev = 1;
    }
    if (pathUnlocked > prev) {
      const newlyLabel = FAMILY_LABELS[families[pathUnlocked - 1]];
      setUnlockToast(newlyLabel);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setUnlockToast(null), 4500);
    }
    if (pathUnlocked !== prev) {
      try {
        localStorage.setItem(KEY, String(pathUnlocked));
      } catch {
        /* storage unavailable */
      }
    }
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [pathUnlocked, families]);

  // The unit "Continue" is currently working through, and how close it is to
  // unlocking the next unit — powers the countdown cue.
  const currentUnit = currentIdx >= 0 ? nodes[currentIdx].unit : null;
  const nextUnitLabel =
    currentIdx >= 0 && currentIdx + 1 < families.length
      ? FAMILY_LABELS[families[currentIdx + 1]]
      : null;

  const currentNode = currentIdx >= 0 ? nodes[currentIdx] : null;
  // What "Continue" plays: the next incomplete lesson, or a replay for mastery
  // if the whole curriculum is complete.
  const continueLesson = currentNode?.nextLesson ?? lessons[0] ?? null;
  const continueNumber = continueLesson
    ? continueLesson.index + 1
    : 0;

  function handleContinue() {
    if (continueLesson) onStartLesson(continueLesson.id);
  }

  // The one unit the hero ring visualises: the unit you're working through, or
  // the last unit once everything is done.
  const heroUnit = currentUnit ?? (nodes.length ? nodes[nodes.length - 1].unit : null);

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

      {/* Unit-unlocked celebration toast */}
      {unlockToast && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-2xl border border-[var(--success)]/40 bg-[var(--success)]/10 px-4 py-3 animate-rank-spring"
        >
          <span aria-hidden="true" className="text-lg">&#x1F513;</span>
          <span className="text-sm font-bold text-[var(--success)]">
            New unit unlocked — {unlockToast}!
          </span>
        </div>
      )}

      {/* FEATURED — Case Files sits at the very top as a showcase (real customer
          wins), always playable and separate from the linear path below. */}
      {caseFilesUnit && (
        <button
          type="button"
          onClick={handleCaseFiles}
          data-testid="case-files-featured"
          className="flex w-full items-center gap-4 rounded-3xl border border-[var(--accent)]/45 bg-[var(--accent-bg)] px-5 py-4 text-left shadow-sm transition-all hover:border-[var(--accent)] active:scale-[0.99] animate-card-deal"
          style={{ transitionTimingFunction: "var(--ease-spring)" }}
          aria-label={`Case Files: Real Customer Wins — ${caseFilesUnit.done} of ${caseFilesUnit.total} lessons done. ${
            caseFilesUnit.complete ? "Mastered" : "Play"
          }`}
        >
          <span
            aria-hidden="true"
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--card)] text-3xl shadow-inner"
          >
            {FAMILY_ICONS[FEATURED_FAMILY]}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Featured
              </span>
              <span className="text-xs font-medium text-[var(--accent-ink)]">
                {caseFilesUnit.done}/{caseFilesUnit.total} lessons
              </span>
            </span>
            <span className="mt-1 block text-base font-extrabold leading-tight text-[var(--ink)]">
              {FAMILY_LABELS[FEATURED_FAMILY]}
            </span>
            <span className="block text-xs text-[var(--text-dim)]">
              Diagnose real Devin customer wins &amp; pick the winning motion
            </span>
          </span>
          <svg
            className="h-5 w-5 flex-shrink-0 text-[var(--accent-ink)]"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* HERO — the single dominant progress moment. One ring for the current
          unit (lessons done / total) with the unlock point marked, the unit
          name, one status line, the Continue CTA, and one journey line. */}
      {heroUnit && (
        <div className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--card)] px-5 py-6 animate-card-deal">
          <HeroRing
            done={heroUnit.done}
            total={heroUnit.total}
            complete={heroUnit.complete}
          />

          <p className="mt-4 text-center text-lg font-extrabold leading-tight text-[var(--ink)]">
            {FAMILY_LABELS[heroUnit.family]}
          </p>

          {/* One tight status line: how close to the next milestone. */}
          {heroUnit.complete ? (
            <p className="mt-1 text-center text-sm font-semibold text-[var(--success)]">
              Mastered · {heroUnit.stars}/{heroUnit.maxStars} &#9733;
            </p>
          ) : heroUnit.clearedNext ? (
            <p className="mt-1 text-center text-sm font-medium text-[var(--success)]">
              &#x2713; Unlocked · {heroUnit.total - heroUnit.done} to master
            </p>
          ) : nextUnitLabel ? (
            <p className="mt-1 text-center text-sm font-medium text-[var(--text-dim)]">
              <span aria-hidden="true">&#x1F513;</span> {heroUnit.lessonsUntilUnlock} to unlock
            </p>
          ) : (
            <p className="mt-1 text-center text-sm font-medium text-[var(--text-dim)]">
              {heroUnit.lessonsUntilUnlock} to finish
            </p>
          )}

          {/* Primary CTA */}
          <button
            type="button"
            onClick={handleContinue}
            data-testid="continue-cta"
            disabled={!continueLesson}
            className="mt-5 w-full rounded-2xl bg-[var(--accent)] py-4 text-center font-bold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.97] min-h-[44px] disabled:opacity-50"
            style={{ transitionTimingFunction: "var(--ease-spring)" }}
            aria-label={
              continueLesson
                ? `Continue — ${FAMILY_LABELS[continueLesson.family]}, lesson ${continueNumber}`
                : "Continue"
            }
          >
            <span className="block text-lg leading-tight">Continue</span>
            {continueLesson && (
              <span className="block text-xs font-medium text-white/85">
                Next up · Lesson {continueNumber}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Practice modes — collapsed by default so they don't compete with the
          hero CTA. One secondary toggle expands the extra-reps grid. */}
      <div>
        <button
          type="button"
          onClick={() => setShowPractice((v) => !v)}
          aria-expanded={showPractice}
          className="flex w-full items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left transition-colors hover:border-[var(--text-dim)] min-h-[44px]"
        >
          <span className="text-sm font-semibold text-[var(--text-dim)]">Practice (extra reps)</span>
          <svg
            className={`h-4 w-4 text-[var(--text-faint)] transition-transform ${showPractice ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {showPractice && (
          <div className="mt-2 grid grid-cols-2 gap-2 animate-card-deal">
            <ModeChip label="Quick Drill" onClick={() => onStart("quick-drill")} />
            <ModeChip label="Speed Round" onClick={() => onStart("speed-round")} />
            <ModeChip label="Boss Deals" onClick={() => onStart("boss-deals")} />
            <ModeChip label="Objection Volley" onClick={() => onStart("objection-volley")} />
            <ModeChip label="Match Pairs" onClick={() => onStart("match-pairs")} />
            <ModeChip label="Family Focus" onClick={() => setShowFamilyPicker(true)} />
          </div>
        )}
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

      {/* Winding path — units as an ordered ladder of lessons */}
      <div className="relative px-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
          Your path
        </p>
        {nodes.map((node, i) => {
          const { unit } = node;
          // The featured unit is showcased in its own card above — keep it out
          // of the linear ladder so it isn't listed twice.
          if (unit.family === FEATURED_FAMILY) return null;
          const isComplete = unit.complete;
          const isCurrent = node.isCurrent;
          const isLocked = !node.isUnlocked;
          const isUnlockedAhead = !isLocked && !isComplete && !isCurrent;
          const isPlayable = !isLocked;
          const prevNode = i > 0 ? nodes[i - 1] : null;
          const remainingInPrev = prevNode?.unit.lessonsUntilUnlock ?? 0;
          const unlockText =
            isLocked && prevNode
              ? `${remainingInPrev} more ${remainingInPrev === 1 ? "lesson" : "lessons"} in ${prevNode.label} to unlock`
              : null;

          const startNode = () => {
            if (isLocked) return;
            if (node.nextLesson) onStartLesson(node.nextLesson.id);
            else if (unit.lessons[0]) onStartLesson(unit.lessons[0].id);
          };

          return (
            <div key={unit.family} className="relative py-1">
              {i > 0 && (
                <div
                  className="absolute left-[27px] top-0 h-4 w-0.5"
                  style={{
                    backgroundColor:
                      isComplete || isCurrent ? "var(--accent)" : "var(--border)",
                  }}
                  aria-hidden="true"
                />
              )}

              {/* The whole row is one large tap target — tapping the icon OR the
                  title enters the module (previously only the small circle did). */}
              <button
                type="button"
                disabled={isLocked}
                onClick={startNode}
                className={`flex w-full items-center gap-4 rounded-2xl py-2 pr-2 text-left transition-colors ${
                  isLocked ? "cursor-not-allowed" : "cursor-pointer hover:bg-[var(--card)] active:scale-[0.99]"
                }`}
                aria-label={`${node.label}: ${
                  isComplete
                    ? "mastered"
                    : isCurrent
                      ? "current — tap to start next lesson"
                      : isUnlockedAhead
                        ? "unlocked — tap to play"
                        : "locked"
                }, ${unit.done} of ${unit.total} lessons`}
              >
                <span
                  className={`relative flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                    ${
                      isCurrent
                        ? "animate-node-bob border-[var(--accent-strong)] bg-[var(--accent-strong)] text-[var(--ink)] shadow-md"
                        : isComplete
                          ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                          : isUnlockedAhead
                            ? "border-[var(--accent)] bg-[var(--card)] text-[var(--accent-ink)]"
                            : "border-[var(--border)] bg-[var(--card)] text-[var(--text-faint)] opacity-60"
                    }`}
                  aria-hidden="true"
                >
                  {isComplete ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isLocked ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="6" y="11" width="12" height="10" rx="2" />
                      <path d="M9 11V7a3 3 0 016 0v4" />
                    </svg>
                  ) : (
                    <span className="text-2xl leading-none">
                      {FAMILY_ICONS[unit.family]}
                    </span>
                  )}
                </span>

                <span className="flex-1 min-w-0">
                  <span
                    className={`block text-sm font-semibold ${
                      isPlayable || isComplete ? "text-[var(--ink)]" : "text-[var(--text-faint)]"
                    }`}
                  >
                    {node.label}
                  </span>
                  {isCurrent && (
                    <span className="font-telemetry block text-xs text-[var(--text-dim)]">
                      {unit.done} of {unit.total} lessons
                      <StarRow stars={Math.round(unit.stars / Math.max(1, unit.done))} inline />
                    </span>
                  )}
                  {isUnlockedAhead && (
                    <span className="font-telemetry block text-xs text-[var(--text-dim)]">
                      {unit.done > 0 ? `${unit.done} of ${unit.total} lessons` : `Unlocked · ${unit.total} lessons`}
                      {unit.done > 0 && (
                        <StarRow stars={Math.round(unit.stars / Math.max(1, unit.done))} inline />
                      )}
                    </span>
                  )}
                  {isComplete && (
                    <span className="font-telemetry block text-xs text-[var(--success)]">
                      Mastered · {unit.stars}/{unit.maxStars} &#9733;
                    </span>
                  )}
                  {isLocked && unlockText && (
                    <span className="block text-xs text-[var(--text-faint)]">{unlockText}</span>
                  )}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Session history */}
      <SessionHistory sessions={sessions} />

      {/* Feedback settings */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <SettingToggle label="Haptics" on={haptics} onToggle={toggleHaptics} />
        <SettingToggle label="Sound" on={sound} onToggle={toggleSound} />
      </div>
    </div>
  );
}

// Hero ring: the single dominant progress dial. Fills done/total and shows
// "N/total lessons" in the centre. A clean full-circle track, no notch.
function HeroRing({
  done,
  total,
  complete,
}: {
  done: number;
  total: number;
  complete: boolean;
}) {
  const size = 140;
  const stroke = 10;
  const r = (size - stroke) / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.max(0, Math.min(1, done / total)) : 0;
  const offset = circ * (1 - pct);
  const track = complete ? "var(--success)" : "var(--accent)";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={track}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 600ms var(--ease-standard)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {complete ? (
          <>
            <span className="text-2xl text-[var(--success)]" aria-hidden="true">&#9733;</span>
            <span className="mt-0.5 text-xs font-semibold text-[var(--success)]">Mastered</span>
          </>
        ) : (
          <>
            <span className="font-telemetry text-3xl font-extrabold leading-none text-[var(--ink)]">
              {done}
              <span className="text-lg text-[var(--text-faint)]">/{total}</span>
            </span>
            <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[var(--text-faint)]">
              lessons done
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function StarRow({ stars, inline }: { stars: number; inline?: boolean }) {
  const clamped = Math.max(0, Math.min(3, stars));
  return (
    <span className={inline ? "ml-1.5" : ""} aria-label={`${clamped} of 3 stars`}>
      {"\u2605".repeat(clamped)}
      <span className="text-[var(--text-faint)]">{"\u2606".repeat(3 - clamped)}</span>
    </span>
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
        ${
          active
            ? "border-[var(--accent)] bg-[var(--accent)] text-white"
            : "border-[var(--border)] bg-[var(--page)] text-[var(--text-dim)] hover:border-[var(--text-dim)]"
        }`}
      style={{ transitionTimingFunction: "var(--ease-standard)" }}
    >
      {label}
    </button>
  );
}
