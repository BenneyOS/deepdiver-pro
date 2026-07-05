import { useMemo, useState } from "react";
import type { ReframeToken } from "../engine/formats";

interface BuildReframeProps {
  tokens: ReframeToken[];
  correctOrder: string[];
  instruction: string;
  onSubmit: (correct: boolean) => void;
}

// Format 4 — assemble the reframe from shuffled clause fragments (with a couple
// of distractors from other cards). Trains recall over recognition. Fragments
// stack and wrap so it works at 390px.
export function BuildReframe({ tokens, correctOrder, instruction, onSubmit }: BuildReframeProps) {
  // Track selection by token index so duplicate fragment text stays distinct.
  const [picked, setPicked] = useState<number[]>([]);

  const pickedSet = useMemo(() => new Set(picked), [picked]);
  const complete = picked.length === correctOrder.length;

  function toggle(i: number) {
    setPicked((prev) => (prev.includes(i) ? prev : [...prev, i]));
  }

  function removeAt(pos: number) {
    setPicked((prev) => prev.filter((_, idx) => idx !== pos));
  }

  function handleSubmit() {
    const assembled = picked.map((i) => tokens[i].text);
    const correct =
      assembled.length === correctOrder.length &&
      assembled.every((t, idx) => t === correctOrder[idx]);
    onSubmit(correct);
  }

  return (
    <div className="mx-auto w-full max-w-md animate-section-enter" style={{ animationDelay: "150ms" }}>
      <p className="mb-3 text-center text-sm font-medium text-[var(--text-dim)]">{instruction}</p>

      {/* Assembly tray */}
      <div
        className="min-h-[72px] rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card-2)] p-3"
        aria-label="Your reframe"
      >
        {picked.length === 0 ? (
          <p className="py-3 text-center text-xs text-[var(--text-faint)]">
            Tap fragments below in the right order
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {picked.map((tokenIdx, pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => removeAt(pos)}
                className="rounded-xl border border-[var(--ink)] bg-[var(--ink)] px-3 py-1.5 text-left text-xs leading-snug text-white active:scale-[0.97] min-h-[36px]"
                aria-label={`Remove: ${tokens[tokenIdx].text}`}
              >
                <span className="mr-1 font-bold text-white/50">{pos + 1}.</span>
                {tokens[tokenIdx].text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fragment bank */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tokens.map((tok, i) => {
          const used = pickedSet.has(i);
          return (
            <button
              key={i}
              type="button"
              disabled={used}
              onClick={() => toggle(i)}
              className={`rounded-xl border px-3 py-1.5 text-left text-xs leading-snug transition-all min-h-[36px] ${
                used
                  ? "cursor-not-allowed border-[var(--border)] bg-[var(--card)] text-[var(--text-faint)] opacity-40"
                  : "border-[var(--border)] bg-[var(--card)] text-[var(--ink)] hover:border-[var(--text-dim)] active:scale-[0.97]"
              }`}
            >
              {tok.text}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex gap-2">
        {picked.length > 0 && (
          <button
            type="button"
            onClick={() => setPicked([])}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-semibold text-[var(--text-dim)] active:scale-[0.97] min-h-[44px]"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          disabled={!complete}
          onClick={handleSubmit}
          className={`flex-1 rounded-2xl py-3 text-center font-bold text-white transition-all min-h-[44px] ${
            complete
              ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98]"
              : "cursor-not-allowed bg-[var(--border)]"
          }`}
        >
          Lock it in
        </button>
      </div>
    </div>
  );
}
