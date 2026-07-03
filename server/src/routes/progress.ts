import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authGuard } from "../middleware/auth.js";

interface ProgressDelta {
  cardId: string;
  box: number;
  seen: number;
  hit: number;
  lastAttemptAt: string;
}

export async function progressRoutes(app: FastifyInstance): Promise<void> {
  // Get user's Leitner progress
  app.get(
    "/progress",
    { preHandler: authGuard },
    async (request, reply) => {
      const userId = request.userId!;

      const progress = await prisma.cardProgress.findMany({
        where: { userId },
      });

      return reply.send({
        progress: progress.map((p) => ({
          cardId: p.cardId,
          box: p.box,
          seen: p.seen,
          hit: p.hit,
          nextDueAt: p.nextDueAt?.toISOString() ?? null,
          lastAttemptAt: p.lastAttemptAt?.toISOString() ?? null,
        })),
      });
    },
  );

  // Batch update progress (reconcile by max box + latest timestamp)
  app.patch<{ Body: { deltas: ProgressDelta[] } }>(
    "/progress",
    { preHandler: authGuard },
    async (request, reply) => {
      const userId = request.userId!;
      const { deltas } = request.body;

      if (!Array.isArray(deltas)) {
        return reply.code(400).send({ error: "deltas must be an array" });
      }

      const results = [];

      for (const delta of deltas) {
        const existing = await prisma.cardProgress.findUnique({
          where: { userId_cardId: { userId, cardId: delta.cardId } },
        });

        const clientAttempt = new Date(delta.lastAttemptAt);

        if (existing) {
          // Reconcile: max box, sum seen/hit, latest timestamp
          const serverAttempt = existing.lastAttemptAt ?? new Date(0);
          const reconciledBox = Math.max(existing.box, delta.box);
          const reconciledSeen = Math.max(existing.seen, delta.seen);
          const reconciledHit = Math.max(existing.hit, delta.hit);
          const reconciledAttempt =
            clientAttempt > serverAttempt ? clientAttempt : serverAttempt;

          const updated = await prisma.cardProgress.update({
            where: { id: existing.id },
            data: {
              box: reconciledBox,
              seen: reconciledSeen,
              hit: reconciledHit,
              lastAttemptAt: reconciledAttempt,
            },
          });
          results.push({
            cardId: updated.cardId,
            box: updated.box,
            seen: updated.seen,
            hit: updated.hit,
            lastAttemptAt: updated.lastAttemptAt?.toISOString() ?? null,
          });
        } else {
          const created = await prisma.cardProgress.create({
            data: {
              userId,
              cardId: delta.cardId,
              box: delta.box,
              seen: delta.seen,
              hit: delta.hit,
              lastAttemptAt: clientAttempt,
            },
          });
          results.push({
            cardId: created.cardId,
            box: created.box,
            seen: created.seen,
            hit: created.hit,
            lastAttemptAt: created.lastAttemptAt?.toISOString() ?? null,
          });
        }
      }

      return reply.send({ progress: results });
    },
  );
}
