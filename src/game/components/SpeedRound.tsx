import { useEffect, useMemo, useRef, useState } from "react";
import type { Card, Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import { useGameStore } from "../store/useGameStore";
import { Ada } from "./Ada";

const DURATION = 60;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFamilyOptions(card: Card): Family[] {
  const others = (Object.keys(FAMILY_LABELS) as Family[]).filter((f) => f !== card.family);
  return shuffle([card.family, ...shuffle(others).slice(0, 3)]);
}

// Format 2 — Speed Round. 60 seconds, identify as many situation families as
// possible. No wager; combo multiplier rewards streaks. Writes each answer to
// the one progress ledger.
export function SpeedRound({ onHome }: { onHome: () => void }) {
  const queue = useGameStore((s) => s.queue);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const finishSpeed = useGameStore((s) => s.finishSpeed);

  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [flash, setFlash] = useState<null | "right" | "wrong">(null);
  const [done, setDone] = useState(false);
  const finished = useRef(false);

  const card = queue[idx % Math.max(queue.length, 1)];
  const options = useMemo(() => (card ? buildFamilyOptions(card) : []), [card]);

  useEffect(() => {
    if (done) return;
    if (timeLeft <= 0) {
      setDone(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, done]);

  useEffect(() => {
    if (done && !finished.current) {
      finished.current = true;
      finishSpeed({ mode: "speed-round", score, hits, total: answered, maxStreak: maxCombo });
    }
  }, [done, finishSpeed, score, hits, answered, maxCombo]);

  function pick(fam: Family) {
    if (done || !card) return;
    const correct = fam === card.family;
    recordAnswer(card, correct);
    setAnswered((a) => a + 1);
    if (correct) {
      const newCombo = combo + 1;
      const mult = Math.min(newCombo, 5);
      setScore((s) => s + 10 * mult);
      setHits((h) => h + 1);
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      setFlash("right");
    } else {
      setCombo(0);
      setFlash("wrong");
    }
    setTimeout(() => setFlash(null), 180);
    setIdx((i) => i + 1);
  }

  if (done) {
    const accuracy = answered > 0 ? Math.round((hits / answered) * 100) : 0;
    return (
      <div className="mx-auto w-full max-w-md space-y-5 text-center animate-card-deal">
        <Ada expression={hits >= 15 ? "impressed" : "pleased"} size={56} />
        <h2 className="text-2xl font-extrabold text-[var(--ink)]">Time!</h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Score" value={score} />
          <Stat label="Correct" value={`${hits}/${answered}`} />
          <Stat label="Best combo" value={`${maxCombo}x`} />
        </div>
        <p className="text-sm text-[var(--text-dim)]">Accuracy {accuracy}%</p>
        <button
          type="button"
          onClick={onHome}
          className="w-full rounded-2xl bg-[var(--accent)] py-4 font-bold text-white active:scale-[0.98] min-h-[44px]"
        >
          Done
        </button>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col">
      {/* Timer + score bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-telemetry text-2xl font-bold tabular-nums text-[var(--ink)]">
            {timeLeft}s
          </span>
          {combo >= 2 && (
            <span className="rounded-full bg-[var(--accent-bg)] px-2 py-0.5 text-xs font-bold text-[var(--accent-ink)] animate-points-glow">
              {Math.min(combo, 5)}x combo
            </span>
          )}
        </div>
        <span className="font-telemetry text-lg font-bold text-[var(--accent-ink)]">{score}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / DURATION) * 100}%` }}
        />
      </div>

      {/* Prompt */}
      <div
        key={idx}
        className={`mt-4 rounded-2xl border p-5 shadow-sm transition-colors animate-card-deal ${
          flash === "right"
            ? "border-[var(--success)] bg-[var(--success)]/10"
            : flash === "wrong"
              ? "border-[var(--danger)] bg-[var(--danger)]/10"
              : "border-[var(--border)] bg-[var(--card)]"
        }`}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-faint)]">
          Which family?
        </p>
        <blockquote className="mt-2 border-l-2 border-[var(--accent)] pl-3 text-base leading-relaxed text-[var(--ink)] font-buyer-quote">
          &ldquo;{card.prompt}&rdquo;
        </blockquote>
      </div>

      {/* Family options */}
      <div className="mt-3 grid grid-cols-1 gap-2">
        {options.map((fam) => (
          <button
            key={fam}
            type="button"
            onClick={() => pick(fam)}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm font-medium text-[var(--ink)] hover:border-[var(--text-dim)] active:scale-[0.97] min-h-[44px]"
          >
            <span className="mr-2 font-bold text-[var(--accent-ink)]">{fam}.</span>
            {FAMILY_LABELS[fam]}
          </button>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-2 py-3">
      <div className="font-telemetry text-xl font-bold text-[var(--ink)]">{value}</div>
      <div className="text-xs text-[var(--text-dim)]">{label}</div>
    </div>
  );
}
