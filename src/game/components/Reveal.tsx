import { useState } from "react";
import type { Card, Tier } from "../../data/schema";
import { FAMILY_LABELS, TIER_LABELS } from "../../data/schema";
import type { Wager } from "../engine/scoring";
import type { AnswerOption } from "../engine/session";
import { roundPoints } from "../engine/scoring";
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
  onNext,
  isLastRound,
}: RevealProps) {
  const points = roundPoints(correct, card.tier, wager);
  const adaMicrocopy = getAdaMicrocopy(correct, wager, streak);
  const adaExpression = correct
    ? (streak >= 3 ? "impressed" : "pleased")
    : "unbothered";

  const [activeTab, setActiveTab] = useState<TabKey>("read");

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      {/* Result banner with Ada */}
      <div
        className={`relative rounded-2xl border p-4 ${
          correct
            ? "bg-[var(--success)]/10 border-[var(--success)]/30"
            : "bg-[var(--danger)]/10 border-[var(--danger)]/30"
        } animate-card-deal`}
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
        className="w-full rounded-2xl bg-[var(--ink)] py-4 text-center font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] min-h-[44px] animate-section-enter"
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
