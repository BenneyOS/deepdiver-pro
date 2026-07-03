import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authGuard } from "../middleware/auth.js";

interface CardImport {
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
  version?: number;
  active?: boolean;
}

interface ImportBody {
  schemaVersion: number;
  contentVersion: number;
  cards: CardImport[];
}

const REQUIRED_FIELDS = [
  "id",
  "family",
  "tier",
  "prompt",
  "pattern",
  "rootCause",
  "consequence",
  "diagnostic",
  "angle",
  "objection",
  "reframe",
  "personaShift",
] as const;

const VALID_FAMILIES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const VALID_TIERS = [1, 2, 3, 4];
const PERSONAS = ["CTO", "VPE", "CFO", "CRO"];

function validateCard(card: CardImport): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    if (!card[field]) {
      errors.push(`Card ${card.id}: missing required field '${field}'`);
    }
  }

  if (!VALID_FAMILIES.includes(card.family)) {
    errors.push(`Card ${card.id}: invalid family '${card.family}'`);
  }

  if (!VALID_TIERS.includes(card.tier)) {
    errors.push(`Card ${card.id}: invalid tier '${card.tier}'`);
  }

  if (card.personaShift) {
    for (const persona of PERSONAS) {
      if (!card.personaShift[persona]) {
        errors.push(`Card ${card.id}: missing persona shift for '${persona}'`);
      }
    }
  }

  return errors;
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // Import/upsert cards from versioned JSON
  app.post<{ Body: ImportBody }>(
    "/admin/import",
    { preHandler: authGuard },
    async (request, reply) => {
      const { schemaVersion, contentVersion, cards } = request.body;

      if (!schemaVersion || !contentVersion || !Array.isArray(cards)) {
        return reply.code(400).send({
          error: "Body must include schemaVersion, contentVersion, and cards array",
        });
      }

      // Validate all cards first
      const allErrors: string[] = [];
      const seenIds = new Set<string>();

      for (const card of cards) {
        if (seenIds.has(card.id)) {
          allErrors.push(`Duplicate card ID: '${card.id}'`);
        }
        seenIds.add(card.id);
        allErrors.push(...validateCard(card));
      }

      if (allErrors.length > 0) {
        return reply.code(400).send({
          error: "Validation failed",
          details: allErrors,
        });
      }

      // Upsert all valid cards
      let created = 0;
      let updated = 0;

      for (const card of cards) {
        const existing = await prisma.card.findUnique({
          where: { id: card.id },
        });

        if (existing) {
          await prisma.card.update({
            where: { id: card.id },
            data: {
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
              version: contentVersion,
              active: card.active ?? true,
            },
          });
          updated++;
        } else {
          await prisma.card.create({
            data: {
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
              version: contentVersion,
              active: card.active ?? true,
            },
          });
          created++;
        }
      }

      return reply.send({
        message: `Import complete: ${created} created, ${updated} updated`,
        contentVersion,
        totalCards: cards.length,
      });
    },
  );
}
