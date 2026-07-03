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
  return (
    <div className="mx-auto w-full max-w-md" role="group" aria-label={tierLabel}>
      <p className="mb-3 text-center text-sm font-medium text-[var(--text-secondary)]" id="tier-label">
        {tierLabel}
      </p>
      <div className="space-y-2" role="radiogroup" aria-labelledby="tier-label">
        {options.map((option, i) => {
          const isSelected = selectedIndex === i;
          const label = String.fromCharCode(65 + i);
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`Option ${label}: ${option.text}`}
              disabled={disabled}
              onClick={() => onSelect(i)}
              className={`w-full rounded-xl px-4 py-3 text-left text-sm leading-relaxed transition-colors
                ${
                  isSelected
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--ink-light)] text-[var(--text-secondary)] hover:bg-slate-700"
                }
                ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                min-h-[44px]`}
            >
              <span className="mr-2 font-bold text-[var(--text-muted)]">
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
