import { useState, useEffect } from "react";
import type { Card, Tier } from "../../data/schema";
import { FAMILY_LABELS, TIER_LABELS } from "../../data/schema";
import type { Wager } from "../engine/scoring";
import type { AnswerOption } from "../engine/session";
import type { ClearEvent } from "../store/useGameStore";
import { roundPoints } from "../engine/scoring";
import { feedbackCorrect, feedbackWrong, feedbackReward } from "../feedback";
import { shouldShowMasteryMoment, buildMasteryMoment, masteryShareText } from "../engine/masteryMoment";
import { Ada } from "./Ada";
import { getAdaMicrocopy } from "./adaMicrocopy";
import { ParticleBurst } from "./ParticleBurst";

interface RevealProps {
  card: Card;
  correct: boolean;
  wager: Wager;
  streak: number;
  options: AnswerOption[];
  selectedIndex: number;
  clearEvent: ClearEvent | null;
  onNext: () => void;
  isLastRound: boolean;
}

const TIER_COLORS: Record<Tier, string> = {
  1: "bg-blue-600/80",
  2: "bg-amber-600/80",
  3: "bg-purple-600/80",
  4: "bg-[var(--danger)]/80",
};

type TabKey = "read" | "why" | "say" | "persona";

const TABS: { key: TabKey; label: string }[] = [
  { key: "read", label: "The read" },
  { key: "why", label: "Why" },
  { key: "say", label: "What to say" },
  { key: "persona", label: "By persona" },
];

export function Reveal({
  card,
  correct,
  wager,
  streak,
  options,
  selectedIndex,
  clearEvent,
  onNext,
  isLastRound,
}: RevealProps) {
  const points = roundPoints(correct, card.tier, wager);
  const adaMicrocopy = getAdaMicrocopy(correct, wager, streak);
  const adaExpression = correct
    ? (streak >= 3 ? "impressed" : "pleased")
    : "unbothered";

  const [activeTab, setActiveTab] = useState<TabKey>("read");
  const [momentCopied, setMomentCopied] = useState(false);

  // Variable reward — compute once per reveal instance so it doesn't flicker.
  const [moment] = useState(() =>
    shouldShowMasteryMoment(correct, streak) ? buildMasteryMoment(card, streak) : null,
  );

  async function shareMoment() {
    const text = masteryShareText(card);
    try {
      if (navigator.share) {
        await navigator.share({ title: card.pattern, text });
        return;
      }
    } catch {
      // dismissed; fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(text);
      setMomentCopied(true);
      setTimeout(() => setMomentCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  }

  // Visceral micro-feedback: fire once per reveal. A unit unlock escalates to
  // the reward cue; otherwise correct/wrong each get a distinct tick + haptic.
  useEffect(() => {
    if (clearEvent?.didUnlock) {
      feedbackReward();
    } else if (correct) {
      feedbackCorrect();
    } else {
      feedbackWrong();
    }
    // Only on mount for this reveal instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      {/* Result banner with Ada */}
      <div
        className={`relative rounded-2xl border p-4 ${
          correct
            ? "bg-[var(--success)]/10 border-[var(--success)]/30 animate-correct-pop"
            : "bg-[var(--danger)]/10 border-[var(--danger)]/30 animate-card-tremor"
        }`}
      >
        <div className="flex items-center gap-3">
          <Ada expression={adaExpression as "neutral" | "pleased" | "thinking" | "impressed" | "unbothered"} size={40} />
          <div className="flex-1">
            <div className={`text-lg font-bold ${correct ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
              {correct ? "Correct" : "Not quite"}
            </div>
            <p className="text-sm text-[var(--text-dim)] italic">
              &ldquo;{adaMicrocopy}&rdquo;
            </p>
          </div>
          {correct && (
            <div className="relative">
              <span className="font-telemetry text-lg font-bold text-[var(--accent-ink)] animate-points-glow">
                +{points}
              </span>
              <ParticleBurst active={correct} color="var(--accent)" count={6} />
            </div>
          )}
        </div>
      </div>

      {/* Mastery Moment — variable, shareable reward (not shown every time) */}
      {moment && (
        <div
          className={`rounded-2xl border p-4 animate-section-enter ${
            moment.flourish
              ? "border-[var(--accent)] bg-[var(--accent-bg)]"
              : "border-[var(--accent)]/40 bg-[var(--card)]"
          }`}
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--accent-ink)]">
                {moment.flourish && <span aria-hidden="true">&#9889;</span>}
                {moment.headline}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink)]">
                &ldquo;{moment.nugget}&rdquo;
              </p>
            </div>
            <button
              type="button"
              onClick={shareMoment}
              className="shrink-0 rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[var(--accent-hover)] min-h-[36px]"
              aria-label="Share this mastery moment"
            >
              {momentCopied ? "Copied" : "Share"}
            </button>
          </div>
        </div>
      )}

      {/* Clear event — unit progress ticks up in the moment */}
      {clearEvent && (
        <div
          className={`rounded-2xl border p-3 animate-card-deal ${
            clearEvent.didUnlock
              ? "border-[var(--accent)] bg-[var(--accent-bg)]"
              : "border-[var(--success)]/30 bg-[var(--success)]/10"
          }`}
          role="status"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--success)] text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div className="flex-1 text-sm">
              <span className="font-bold text-[var(--ink)]">Cleared &mdash; added to your path.</span>{" "}
              <span className="text-[var(--text-dim)]">{clearEvent.familyLabel}:</span>{" "}
              <span className="inline-block font-telemetry font-bold text-[var(--success)] animate-clear-tick">
                {clearEvent.clearedCount} of {clearEvent.familyTotal}
              </span>
            </div>
          </div>
          {clearEvent.didUnlock && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[var(--accent-ink)]">
              <span aria-hidden="true">&#128275;</span>
              Next unit unlocked!
            </p>
          )}
        </div>
      )}

      {/* Option verdict — always visible, no scroll needed */}
      <div className="space-y-1.5 animate-section-enter" style={{ animationDelay: "80ms" }}>
        {options.map((option, i) => {
          const isCorrectOption = option.correct;
          const isPlayerPick = i === selectedIndex;
          const isDimmed = !isCorrectOption && !isPlayerPick;
          const label = String.fromCharCode(65 + i);

          let borderColor = "border-[var(--border)]";
          let bgColor = "bg-[var(--card)]";
          let textColor = "text-[var(--ink)]";
          let badge = null;

          if (isCorrectOption) {
            borderColor = "border-[var(--success)]";
            bgColor = "bg-[var(--success)]/10";
            badge = (
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-[var(--success)] whitespace-nowrap">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Correct answer
              </span>
            );
          } else if (isPlayerPick && !correct) {
            borderColor = "border-[var(--danger)]";
            bgColor = "bg-[var(--danger)]/10";
            badge = (
              <span className="ml-auto flex items-center gap-1 text-xs font-bold text-[var(--danger)] whitespace-nowrap">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Your pick
              </span>
            );
          }

          if (isDimmed) {
            textColor = "text-[var(--text-faint)]";
          }

          return (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-2xl border px-4 py-2.5 text-sm leading-relaxed transition-opacity ${borderColor} ${bgColor} ${isDimmed ? "opacity-50" : ""}`}
            >
              <span className={`font-bold ${isDimmed ? "text-[var(--text-faint)]" : isCorrectOption ? "text-[var(--success)]" : isPlayerPick ? "text-[var(--danger)]" : "text-[var(--text-faint)]"}`}>
                {label}.
              </span>
              <span className={`flex-1 ${textColor}`}>{option.text}</span>
              {badge}
            </div>
          );
        })}
      </div>

      {/* Tabbed reasoning */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden animate-section-enter" style={{ animationDelay: "160ms" }}>
        {/* Tab bar */}
        <div className="flex border-b border-[var(--border)]" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-2 py-2.5 text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-[var(--ink)] text-[var(--ink)] bg-[var(--page)]"
                  : "text-[var(--text-faint)] hover:text-[var(--text-dim)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {/* Header badges */}
          <div className="mb-3 flex items-center justify-between">
            <span className="rounded-full border border-[var(--border)] bg-[var(--card-2)] px-3 py-1 text-xs font-medium text-[var(--text-dim)]">
              {FAMILY_LABELS[card.family]}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold text-white ${TIER_COLORS[card.tier]}`}
            >
              T{card.tier} &middot; {TIER_LABELS[card.tier]}
            </span>
          </div>

          {activeTab === "read" && (
            <div className="space-y-3">
              <p className="text-sm text-[var(--text-dim)]">
                <span className="font-semibold text-[var(--ink)]">Pattern:</span>{" "}
                {card.pattern}
              </p>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card-2)] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)] mb-1">
                  The winning read
                </p>
                <p className="text-sm leading-relaxed text-[var(--ink)]">
                  {card.reframe}
                </p>
              </div>
            </div>
          )}

          {activeTab === "why" && (
            <div className="space-y-3">
              <DiagField label="Root Cause" value={card.rootCause} />
              <DiagField label="Consequence" value={card.consequence} />
              <DiagField label="Diagnostic Question" value={card.diagnostic} />
            </div>
          )}

          {activeTab === "say" && (
            <div className="space-y-3">
              <DiagField label="Objection" value={card.objection} />
              <DiagField label="Reframe Script" value={card.reframe} />
              <DiagField label="Angle" value={card.angle} />
            </div>
          )}

          {activeTab === "persona" && (
            <div className="grid grid-cols-2 gap-2">
              {(["CTO", "VPE", "CFO", "CRO"] as const).map((persona) => (
                <div
                  key={persona}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card-2)] px-3 py-2"
                >
                  <span className="text-xs font-bold text-[var(--accent-ink)]">
                    {persona}
                  </span>
                  <p className="mt-0.5 text-xs text-[var(--text-dim)]">
                    {card.personaShift[persona]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Next button — always visible */}
      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-2xl bg-[var(--accent)] py-4 text-center font-bold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.98] min-h-[44px] animate-section-enter"
        style={{ animationDelay: "240ms", transitionTimingFunction: "var(--ease-standard)" }}
      >
        {isLastRound ? "View Scorecard" : "Next Deal"}
      </button>
    </div>
  );
}

function DiagField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
        {label}
      </p>
      <p className="text-sm leading-relaxed text-[var(--text-dim)]">
        {value}
      </p>
    </div>
  );
}
