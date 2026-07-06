import { useState } from "react";
import type { Seed, Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { SessionMode } from "../engine/session";
import { totalMastered } from "../engine/progress";
import {
  allLessons,
  unitState,
  isUnitUnlocked,
  currentUnitIndex,
  nextLessonInUnit,
  completedLessonCount,
  type UnitState,
  type LessonRef,
} from "../engine/curriculum";
import { useSessionHistory } from "../store/useSessionHistory";
import { useProgressStore } from "../store/useProgressStore";
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
  const { progressMap } = useProgressStore();
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

  // Headline progression — lessons completed. This moves every session.
  const lessons = allLessons(seed.cards, families);
  const totalLessons = lessons.length;
  const lessonsDone = completedLessonCount(completed);
  const lessonsPct = totalLessons > 0 ? Math.round((lessonsDone / totalLessons) * 100) : 0;
  const unitsDone = nodes.filter((n) => n.unit.complete).length;
  const masteredCount = totalMastered(seed.cards, progressMap);

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

      {/* Primary CTA — starts the next lesson in your path */}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!continueLesson}
        className="w-full rounded-2xl bg-[var(--accent)] py-4 text-center font-bold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.97] min-h-[44px] animate-card-deal disabled:opacity-50"
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
            {FAMILY_LABELS[continueLesson.family]} · Lesson {continueNumber} of {continueUnit.total}
          </span>
        )}
      </button>

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

      {/* Progression header — LESSONS completed (moves every session). */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--ink)]">Your progress</span>
          <span className="font-telemetry font-semibold text-[var(--ink)]">
            {lessonsDone} of {totalLessons} lessons
          </span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${lessonsPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-[var(--text-dim)]">
          <span>{unitsDone} of {families.length} units complete</span>
          <span className="font-telemetry">{masteredCount} cards mastered</span>
        </div>
      </div>

      {/* Practice modes — extra reps outside the path */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
          Practice (extra reps)
        </p>
        <div className="grid grid-cols-2 gap-2">
          <ModeChip label="Quick Drill" onClick={() => onStart("quick-drill")} />
          <ModeChip label="Speed Round" onClick={() => onStart("speed-round")} />
          <ModeChip label="Boss Deals" onClick={() => onStart("boss-deals")} />
          <ModeChip label="Objection Volley" onClick={() => onStart("objection-volley")} />
          <ModeChip label="Match Pairs" onClick={() => onStart("match-pairs")} />
          <ModeChip label="Family Focus" onClick={() => setShowFamilyPicker(true)} />
        </div>
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
          const prevNode = i > 0 ? nodes[i - 1] : null;
          const unlockText =
            isLocked && prevNode
              ? `Complete ${prevNode.label} to unlock`
              : null;

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

              <button
                type="button"
                disabled={isLocked}
                onClick={() => {
                  if (node.nextLesson) onStartLesson(node.nextLesson.id);
                  else if (unit.lessons[0]) onStartLesson(unit.lessons[0].id);
                }}
                className={`relative flex h-[58px] w-[58px] flex-shrink-0 items-center justify-center rounded-full border-2 transition-all
                  ${
                    isCurrent
                      ? "animate-node-bob border-[var(--accent-strong)] bg-[var(--accent-strong)] text-[var(--ink)] shadow-md active:scale-[0.93] cursor-pointer"
                      : isComplete
                        ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)] cursor-pointer active:scale-[0.95]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--text-faint)] cursor-not-allowed opacity-60"
                  }
                  min-h-[44px]`}
                aria-label={`${node.label}: ${
                  isComplete ? "complete" : isCurrent ? "current — tap to start next lesson" : "locked"
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

              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    isCurrent || isComplete ? "text-[var(--ink)]" : "text-[var(--text-faint)]"
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
                {isComplete && (
                  <p className="font-telemetry text-xs text-[var(--success)]">
                    Complete · {unit.stars}/{unit.maxStars} &#9733;
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
