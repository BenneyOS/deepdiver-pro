import { readFileSync } from "fs";
import { prisma } from "./lib/prisma.js";

interface SeedCard {
  id: string;
  family: string;
  tier: number;
  prompt: string;
  pattern: string;
  rootCause: string;
  consequence: string;
  diagnostic: string;
  angle: string;
  objection: string;
  reframe: string;
  personaShift: Record<string, string>;
  version: number;
  active: boolean;
}

async function seed(): Promise<void> {
  const raw = readFileSync(
    new URL("../../data/seed.json", import.meta.url),
    "utf-8",
  );
  const data = JSON.parse(raw) as { cards: SeedCard[] };

  for (const card of data.cards) {
    await prisma.card.upsert({
      where: { id: card.id },
      update: {
        family: card.family,
        tier: card.tier,
        prompt: card.prompt,
        pattern: card.pattern,
        rootCause: card.rootCause,
        consequence: card.consequence,
        diagnostic: card.diagnostic,
        angle: card.angle,
        objection: card.objection,
        reframe: card.reframe,
        personaShift: card.personaShift,
        version: card.version,
        active: card.active,
      },
      create: {
        id: card.id,
        family: card.family,
        tier: card.tier,
        prompt: card.prompt,
        pattern: card.pattern,
        rootCause: card.rootCause,
        consequence: card.consequence,
        diagnostic: card.diagnostic,
        angle: card.angle,
        objection: card.objection,
        reframe: card.reframe,
        personaShift: card.personaShift,
        version: card.version,
        active: card.active,
      },
    });
  }

  console.log(`Seeded ${data.cards.length} cards.`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
