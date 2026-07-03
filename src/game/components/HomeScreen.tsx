import { useState } from "react";
import type { Seed, Family } from "../../data/schema";
import { FAMILY_LABELS } from "../../data/schema";
import type { SessionMode } from "../engine/session";
import { useSessionHistory } from "../store/useSessionHistory";
import { SessionHistory } from "./SessionHistory";

interface HomeScreenProps {
  seed: Seed;
  cardsSeen: number;
  onStart: (mode: SessionMode, focusFamily?: Family) => void;
}

export function HomeScreen({ seed, cardsSeen, onStart }: HomeScreenProps) {
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);

  const families = Object.keys(seed.families) as Family[];

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
          description="12 cards — weighted to tiers 3-4 (diagnostics & objections)"
          onClick={() => onStart("boss-deals")}
        />
        <ModeButton
          title="Family Focus"
          description="7 cards — drill a single situation family"
          onClick={() => setShowFamilyPicker(!showFamilyPicker)}
        />
      </div>

      {/* Family picker for Family Focus mode */}
      {showFamilyPicker && (
        <div className="rounded-2xl bg-[var(--ink-light)] p-4 shadow-xl animate-card-deal">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
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
                className="rounded-xl bg-slate-700 px-3 py-3 text-left transition-colors hover:bg-slate-600 min-h-[44px]"
              >
                <span className="text-xs font-bold text-[var(--accent)]">{fam}.</span>{" "}
                <span className="text-xs text-[var(--text-secondary)]">
                  {FAMILY_LABELS[fam]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

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
}

function ModeButton({ title, description, onClick }: ModeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl bg-[var(--ink-light)] p-4 text-left transition-colors hover:bg-slate-700 min-h-[44px]"
    >
      <span className="font-bold text-[var(--text-primary)]">{title}</span>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{description}</p>
    </button>
  );
}
