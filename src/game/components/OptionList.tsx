import { useState } from "react";
import type { AnswerOption } from "../engine/session";

interface OptionListProps {
  options: AnswerOption[];
  tierLabel: string;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  disabled: boolean;
}

export function OptionList({
  options,
  tierLabel,
  selectedIndex,
  onSelect,
  disabled,
}: OptionListProps) {
  const [bouncingIdx, setBouncingIdx] = useState<number | null>(null);

  function handleSelect(i: number) {
    setBouncingIdx(i);
    setTimeout(() => {
      setBouncingIdx(null);
      onSelect(i);
    }, 200);
  }

  return (
    <div className="mx-auto w-full max-w-md animate-section-enter" role="group" aria-label={tierLabel} style={{ animationDelay: "150ms" }}>
      <p className="mb-3 text-center text-sm font-medium text-[var(--text-dim)]" id="tier-label">
        {tierLabel}
      </p>
      <div className="space-y-2" role="radiogroup" aria-labelledby="tier-label">
        {options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const isBouncing = bouncingIdx === i;
          const label = String.fromCharCode(65 + i);
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Option ${label}: ${option.text}`}
              disabled={disabled}
              onClick={() => handleSelect(i)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm leading-relaxed transition-all
                ${
                  isSelected
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--ink)] hover:border-[var(--text-dim)]"
                }
                ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer active:scale-[0.97]"}
                ${isBouncing ? "animate-option-bounce" : ""}
                min-h-[44px]`}
              style={{ transitionTimingFunction: "var(--ease-standard)" }}
            >
              <span className={`mr-2 font-bold ${isSelected ? "text-white/60" : "text-[var(--text-faint)]"}`}>
                {label}.
              </span>
              {option.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
