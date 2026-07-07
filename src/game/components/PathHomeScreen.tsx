import { useEffect, useRef, useState } from "react";
import type { Seed, Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { SessionMode } from "../engine/session";
import {
  allLessons,
  unitState,
  isUnitUnlocked,
  currentUnitIndex,
  nextLessonInUnit,
  unlockedUnitCount,
  type UnitState,
  type LessonRef,
} from "../engine/curriculum";
import { useSessionHistory } from "../store/useSessionHistory";
import { useCurriculum } from "../store/useCurriculum";
import { usePortfolio } from "../store/usePortfolio";
import { useSettings } from "../store/useSettings";
import { useStreak } from "../store/useStreak";
import { SessionHistory } from "./SessionHistory";
import { Ada } from "./Ada";

interface PathHomeScreenProps {
  seed: Seed;
  onStart: (mode: SessionMode, focusFamily?: Family) => void;
  onStartLesson: (lessonId: string) => void;
  onOpenPortfolio: () => void;
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
  onOpenPortfolio,
}: PathHomeScreenProps) {
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const { sessions } = useSessionHistory();
  const completed = useCurriculum((s) => s.completed);
  const portfolioCount = usePortfolio((s) => s.pitches.length);
  const { haptics, sound, toggleHaptics, toggleSound } = useSettings();
  const { count: dayStreak, atRisk, freezes } = useStreak();

  const families = Object.keys(seed.families) as Family[];
  const currentIdx = currentUnitIndex(seed.cards, families, completed);

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
  const unitsUnlocked = unlockedUnitCount(seed.cards, families, completed);

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
    if (unitsUnlocked > prev) {
      const newlyLabel = FAMILY_LABELS[families[unitsUnlocked - 1]];
      setUnlockToast(newlyLabel);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setUnlockToast(null), 4500);
    }
    if (unitsUnlocked !== prev) {
      try {
        localStorage.setItem(KEY, String(unitsUnlocked));
      } catch {
        /* storage unavailable */
      }
    }
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, [unitsUnlocked, families]);

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
  const continueUnit = continueLesson
    ? unitState(seed.cards, continueLesson.family, completed)
    : null;

  function handleContinue() {
    if (continueLesson) onStartLesson(continueLesson.id);
  }

  // The one unit the hero ring visualises: the unit you're working through, or
  // the last unit once everything is done.
  const heroUnit = currentUnit ?? (nodes.length ? nodes[nodes.length - 1].unit : null);
  // Where you are in the 14-unit journey (1-based). The single "journey" number.
  const journeyPos = currentIdx >= 0 ? currentIdx + 1 : families.length;

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

      {/* HERO — the single dominant progress moment. One ring for the current
          unit (lessons done / total) with the unlock point marked, the unit
          name, one status line, the Continue CTA, and one journey line. */}
      {heroUnit && (
        <div className="flex flex-col items-center rounded-3xl border border-[var(--border)] bg-[var(--card)] px-5 py-6 animate-card-deal">
          <HeroRing
            done={heroUnit.done}
            total={heroUnit.total}
            threshold={heroUnit.unlockThreshold}
            complete={heroUnit.complete}
          />

          <p className="mt-4 text-center text-lg font-extrabold leading-tight text-[var(--ink)]">
            {FAMILY_LABELS[heroUnit.family]}
          </p>

          {/* One status line: how close to the next milestone. */}
          {heroUnit.complete ? (
            <p className="mt-1 text-center text-sm font-semibold text-[var(--success)]">
              Mastered · {heroUnit.stars}/{heroUnit.maxStars} &#9733;
            </p>
          ) : heroUnit.clearedNext ? (
            <p className="mt-1 text-center text-sm font-medium text-[var(--success)]">
              &#x2713; {nextUnitLabel ? `${nextUnitLabel} unlocked` : "Next unit unlocked"} ·{" "}
              {heroUnit.total - heroUnit.done} more to master
            </p>
          ) : (
            <p className="mt-1 text-center text-sm font-medium text-[var(--text-dim)]">
              <span aria-hidden="true">&#x1F513;</span>{" "}
              {heroUnit.lessonsUntilUnlock} more {heroUnit.lessonsUntilUnlock === 1 ? "lesson" : "lessons"}
              {nextUnitLabel ? ` to unlock ${nextUnitLabel}` : " to finish"}
            </p>
          )}

          {/* Primary CTA */}
          <button
            type="button"
            onClick={handleContinue}
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
            {continueLesson && continueUnit && (
              <span className="block text-xs font-medium text-white/85">
                Lesson {continueNumber} of {continueUnit.total}
              </span>
            )}
          </button>

          {/* The one journey line */}
          <p className="mt-3 font-telemetry text-xs text-[var(--text-faint)]">
            Unit {journeyPos} of {families.length}
          </p>
        </div>
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

      {/* Winding path — units as an ordered ladder of lessons */}
      <div className="relative px-2">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
          Your path
        </p>
        {nodes.map((node, i) => {
          const { unit } = node;
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
          const ringPct = unit.total > 0 ? unit.done / unit.total : 0;

          return (
            <div key={unit.family} className="relative flex items-center gap-4 py-2">
              {i > 0 && (
                <div
                  className="absolute left-[27px] -top-2 h-4 w-0.5"
                  style={{
                    backgroundColor:
                      isComplete || isCurrent ? "var(--accent)" : "var(--border)",
                  }}
                  aria-hidden="true"
                />
              )}

              <div className="relative flex-shrink-0">
                {(isCurrent || isUnlockedAhead) && (
                  <RingProgress pct={ringPct} />
                )}
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    if (node.nextLesson) onStartLesson(node.nextLesson.id);
                    else if (unit.lessons[0]) onStartLesson(unit.lessons[0].id);
                  }}
                  className={`relative flex h-[58px] w-[58px] items-center justify-center rounded-full border-2 transition-all
                    ${
                      isCurrent
                        ? "animate-node-bob border-[var(--accent-strong)] bg-[var(--accent-strong)] text-[var(--ink)] shadow-md active:scale-[0.93] cursor-pointer"
                        : isComplete
                          ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)] cursor-pointer active:scale-[0.95]"
                          : isUnlockedAhead
                            ? "border-[var(--accent)] bg-[var(--card)] text-[var(--accent-ink)] cursor-pointer active:scale-[0.95]"
                            : "border-[var(--border)] bg-[var(--card)] text-[var(--text-faint)] cursor-not-allowed opacity-60"
                    }
                    min-h-[44px]`}
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
                  {isComplete ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isLocked ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <rect x="6" y="11" width="12" height="10" rx="2" />
                      <path d="M9 11V7a3 3 0 016 0v4" />
                    </svg>
                  ) : (
                    <span className="font-extrabold text-sm">{unit.family}</span>
                  )}
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    isPlayable || isComplete ? "text-[var(--ink)]" : "text-[var(--text-faint)]"
                  }`}
                >
                  {node.label}
                </p>
                {isCurrent && (
                  <p className="font-telemetry text-xs text-[var(--text-dim)]">
                    Lesson {unit.done + 1} of {unit.total}
                    <StarRow stars={Math.round(unit.stars / Math.max(1, unit.done))} inline />
                  </p>
                )}
                {isUnlockedAhead && (
                  <p className="font-telemetry text-xs text-[var(--text-dim)]">
                    {unit.done > 0 ? `Lesson ${unit.done + 1} of ${unit.total}` : `Unlocked · ${unit.total} lessons`}
                    {unit.done > 0 && (
                      <StarRow stars={Math.round(unit.stars / Math.max(1, unit.done))} inline />
                    )}
                  </p>
                )}
                {isComplete && (
                  <p className="font-telemetry text-xs text-[var(--success)]">
                    Mastered · {unit.stars}/{unit.maxStars} &#9733;
                  </p>
                )}
                {isLocked && unlockText && (
                  <p className="text-xs text-[var(--text-faint)]">{unlockText}</p>
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
        <SettingToggle label="Haptics" on={haptics} onToggle={toggleHaptics} />
        <SettingToggle label="Sound" on={sound} onToggle={toggleSound} />
      </div>
    </div>
  );
}

// Hero ring: the single dominant progress dial. Fills done/total, marks the
// unlock checkpoint with a notch, and shows "N/total lessons" in the centre.
function HeroRing({
  done,
  total,
  threshold,
  complete,
}: {
  done: number;
  total: number;
  threshold: number;
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

  // Notch at the unlock checkpoint, measured from 12 o'clock going clockwise.
  const notchFrac = total > 0 ? Math.min(1, threshold / total) : 0;
  const notchAngle = (-90 + notchFrac * 360) * (Math.PI / 180);
  const nx = cx + r * Math.cos(notchAngle);
  const ny = cy + r * Math.sin(notchAngle);
  const reached = done >= threshold;
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
        {!complete && notchFrac < 1 && (
          <circle
            cx={nx}
            cy={ny}
            r={5}
            fill={reached ? "var(--success)" : "var(--card)"}
            stroke={reached ? "var(--success)" : "var(--accent-strong)"}
            strokeWidth="2.5"
          />
        )}
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

// Thin circular progress ring drawn just outside a 58px node, showing how many
// of the unit's lessons are done. Purely decorative (node carries the label).
function RingProgress({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(1, pct));
  const size = 66;
  const r = 31;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none absolute -left-1 -top-1"
      aria-hidden="true"
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 500ms var(--ease-standard)" }}
      />
    </svg>
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
