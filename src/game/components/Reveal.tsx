import { useState, useEffect } from "react";
import type { Card } from "../../data/schema";
import { FAMILY_LABELS, TIER_LABELS } from "../../data/schema";
import type { Wager } from "../engine/scoring";
import type { AnswerOption } from "../engine/session";
import type { ClearEvent } from "../store/useGameStore";
import { roundPoints } from "../engine/scoring";
import { feedbackCorrect, feedbackWrong, feedbackReward } from "../feedback";
import { shouldShowMasteryMoment, buildMasteryMoment, masteryShareText } from "../engine/masteryMoment";
import { allPersonaLenses } from "../engine/persona";
import { breakdownDefaultOpen, bumpRevealsSeen } from "../engine/disclosure";
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

  const [momentCopied, setMomentCopied] = useState(false);

  // Variable reward — compute once per reveal instance so it doesn't flicker.
  const [moment] = useState(() =>
    shouldShowMasteryMoment(correct, streak) ? buildMasteryMoment(card, streak) : null,
  );

  // Progressive disclosure: the generic breakdown opens by default for the
  // player's first couple of reveals, then collapses so it stops feeling
  // repetitive. The bespoke "so what" above stays visible either way.
  const [breakdownOpen, setBreakdownOpen] = useState(() =>
    breakdownDefaultOpen(bumpRevealsSeen()),
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
      {/* Result line — compact, no oversized mascot competing with the lesson. */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${
              correct ? "bg-[var(--success)]" : "bg-[var(--danger)]"
            }`}
            aria-hidden="true"
          >
            {correct ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </span>
          <span className={`text-base font-bold ${correct ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
            {correct ? "Correct" : "Not quite"}
          </span>
        </div>
        {correct && (
          <div className="relative">
            <span className="font-telemetry text-base font-bold text-[var(--accent-ink)] animate-points-glow">
              +{points}
            </span>
            <ParticleBurst active={correct} color="var(--accent)" count={6} />
          </div>
        )}
      </div>

      {/* THE SO WHAT — the hero of every reveal. A bespoke, transferable
          takeaway, distinct from the answer text, so no two reveals feel the
          same and there's a real learning every time. */}
      <div
        className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent-bg)] p-4 animate-section-enter"
        style={{ animationDelay: "40ms" }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-ink)]">
          The so what
        </p>
        <p className="mt-1.5 text-[15px] font-semibold leading-snug text-[var(--ink)]">
          {card.soWhat}
        </p>
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

      {/* Clear event — a first-time correct read on this card. */}
      {clearEvent && (
        <div
          className="rounded-2xl border border-[var(--success)]/30 bg-[var(--success)]/10 p-3 animate-card-deal"
          role="status"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--success)] text-white">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <div className="flex-1 text-sm">
              <span className="font-bold text-[var(--ink)]">New read cleared</span>{" "}
              <span className="text-[var(--text-dim)]">&mdash; a first for this {clearEvent.familyLabel} card.</span>
            </div>
          </div>
        </div>
      )}

      {/* Answer verdict — the correct option (and the player's miss). This is
          the only place the winning read appears; the breakdown no longer
          reprints it. */}
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
                Winning read
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

      {/* Full breakdown — collapsible. Open by default early on, then collapses
          so repeat reveals stay light. */}
      <div
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden animate-section-enter"
        style={{ animationDelay: "120ms" }}
      >
        <button
          type="button"
          onClick={() => setBreakdownOpen((v) => !v)}
          aria-expanded={breakdownOpen}
          className="flex w-full items-center gap-2 px-4 py-3 text-left min-h-[44px]"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-dim)]">
            Full breakdown
          </span>
          <span className="text-[11px] text-[var(--text-faint)]">
            {FAMILY_LABELS[card.family]} &middot; {TIER_LABELS[card.tier]}
          </span>
          <span
            className={`ml-auto text-[var(--text-faint)] transition-transform ${breakdownOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            &#9662;
          </span>
        </button>

        {breakdownOpen && (
          <div className="space-y-4 border-t border-[var(--border)] p-4">
            {/* Trimmed to the two lines that are actually usable in the room:
               the sharp question to ask, and the exact reframe to say. The
               "so what" above carries the insight; root cause / consequence /
               angle are intentionally omitted to cut cognitive load. */}
            <Section label="Ask this">
              <p className="text-sm leading-relaxed text-[var(--ink)]">{card.diagnostic}</p>
            </Section>

            <Section label="Say it like this">
              <div className="rounded-xl border-l-2 border-[var(--accent)] bg-[var(--card-2)] px-3 py-2">
                <p className="text-sm leading-relaxed text-[var(--ink)]">
                  &ldquo;{card.reframe}&rdquo;
                </p>
              </div>
            </Section>

            <PersonaSection card={card} />
          </div>
        )}
      </div>

      {/* Next button — always visible */}
      <button
        type="button"
        onClick={onNext}
        className="w-full rounded-2xl bg-[var(--accent)] py-4 text-center font-bold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] active:scale-[0.98] min-h-[44px] animate-section-enter"
        style={{ animationDelay: "200ms", transitionTimingFunction: "var(--ease-standard)" }}
      >
        {isLastRound ? "View Scorecard" : "Next Deal"}
      </button>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-faint)]">
        {label}
      </p>
      {children}
    </div>
  );
}

function PersonaSection({ card }: { card: Card }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 text-left min-h-[36px]"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-faint)]">
          Same situation, four rooms
        </span>
        <span
          className={`ml-auto text-[var(--text-faint)] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          &#9662;
        </span>
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {allPersonaLenses(card).map((lens) => (
            <PersonaCard key={lens.persona} lens={lens} />
          ))}
        </div>
      )}
    </div>
  );
}

function PersonaCard({ lens }: { lens: ReturnType<typeof allPersonaLenses>[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card-2)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left min-h-[44px]"
      >
        <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs font-bold text-[var(--accent-ink)]">
          {lens.persona}
        </span>
        <span className="flex-1 text-xs font-medium text-[var(--text-dim)]">
          Cares about {lens.cares}
        </span>
        <span
          className={`text-[var(--text-faint)] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          &#9662;
        </span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-[var(--border)] px-3 py-2.5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-faint)]">
              Why it lands
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-dim)]">
              {lens.why}
            </p>
          </div>
          <div className="rounded-lg border-l-2 border-[var(--accent)] bg-[var(--card)] px-2.5 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-faint)]">
              Say it like this
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--ink)]">
              &ldquo;{lens.say}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

