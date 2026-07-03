import type { Seed } from "./data/schema";
import seedData from "./data/seed.json";
import { ScenarioCard } from "./game/components/ScenarioCard";

const seed = seedData as Seed;
const firstCard = seed.cards[0];

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[var(--ink)] px-4 py-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Read the Room
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Diagnostic selling, one card at a time
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {seed.cards.length} scenarios &middot; {Object.keys(seed.families).length} families &middot; 4 tiers
        </p>
      </header>

      {/* Single static card (M0) */}
      {firstCard && <ScenarioCard card={firstCard} />}
    </div>
  );
}

export default App;
