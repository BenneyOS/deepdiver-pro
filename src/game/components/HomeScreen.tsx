import type { Seed } from "../../data/schema";
import type { SessionMode } from "../engine/session";
import { useSessionHistory } from "../store/useSessionHistory";
import { SessionHistory } from "./SessionHistory";

interface HomeScreenProps {
  seed: Seed;
  cardsSeen: number;
  onStart: (mode: SessionMode) => void;
}

export function HomeScreen({ seed, cardsSeen, onStart }: HomeScreenProps) {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Read the Room
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Diagnostic selling, one card at a time
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Cards" value={String(seed.cards.length)} />
        <StatCard label="Families" value={String(Object.keys(seed.families).length)} />
        <StatCard label="Seen" value={String(cardsSeen)} />
      </div>

      {/* Mode buttons */}
      <div className="space-y-3">
        <ModeButton
          title="Quick Drill"
          description="7 cards — spaced repetition targets your weak spots"
          onClick={() => onStart("quick-drill")}
        />
        <ModeButton
          title="Boss Deals"
          description="12 cards — weighted to tiers 3–4 (questions & objections)"
          onClick={() => onStart("boss-deals")}
          disabled
          comingSoon
        />
        <ModeButton
          title="Family Focus"
          description="7 cards — drill a single situation family"
          onClick={() => onStart("family-focus")}
          disabled
          comingSoon
        />
      </div>

      {/* Session history */}
      <SessionHistorySection />
    </div>
  );
}

function SessionHistorySection() {
  const { sessions } = useSessionHistory();
  return <SessionHistory sessions={sessions} />;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--ink-light)] p-3 text-center shadow">
      <div className="text-xl font-bold text-[var(--accent)]">{value}</div>
      <div className="text-xs text-[var(--text-muted)]">{label}</div>
    </div>
  );
}

interface ModeButtonProps {
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

function ModeButton({
  title,
  description,
  onClick,
  disabled,
  comingSoon,
}: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl p-4 text-left transition-colors min-h-[44px]
        ${
          disabled
            ? "cursor-not-allowed bg-slate-800/50 opacity-60"
            : "bg-[var(--ink-light)] hover:bg-slate-700"
        }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-[var(--text-primary)]">{title}</span>
        {comingSoon && (
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-[var(--text-muted)]">
            M5
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
    </button>
  );
}
