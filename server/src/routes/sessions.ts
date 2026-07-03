import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authGuard } from "../middleware/auth.js";

interface SessionBody {
  mode: string;
  score: number;
  total: number;
  hits: number;
  maxStreak: number;
  answers: Array<{ cardId: string; correct: boolean; tier: number; wager: string }>;
}

export async function sessionRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: SessionBody }>(
    "/sessions",
    { preHandler: authGuard },
    async (request, reply) => {
      const userId = request.userId!;
      const { mode, score, total, hits, maxStreak, answers } = request.body;

      const session = await prisma.gameSession.create({
        data: {
          userId,
          mode,
          score,
          total,
          hits,
          maxStreak,
          answers,
        },
      });

      return reply.code(201).send({ sessionId: session.id });
    },
  );

  // GET /me - profile summary
  app.get(
    "/me",
    { preHandler: authGuard },
    async (request, reply) => {
      const userId = request.userId!;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          sessions: { orderBy: { createdAt: "desc" }, take: 10 },
          progress: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ error: "User not found" });
      }

      const totalSessions = await prisma.gameSession.count({
        where: { userId },
      });

      const mastered = user.progress.filter((p) => p.box >= 4).length;

      return reply.send({
        userId: user.id,
        email: user.email,
        totalSessions,
        cardsSeenCount: user.progress.length,
        cardsMastered: mastered,
        recentSessions: user.sessions.map((s) => ({
          id: s.id,
          mode: s.mode,
          score: s.score,
          hits: s.hits,
          total: s.total,
          createdAt: s.createdAt.toISOString(),
        })),
      });
    },
  );
}
