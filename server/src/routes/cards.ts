import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function cardRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { version?: string } }>(
    "/cards",
    async (request, reply) => {
      const sinceVersion = Number(request.query.version) || 0;

      const cards = await prisma.card.findMany({
        where: {
          active: true,
          version: { gt: sinceVersion },
        },
        orderBy: { id: "asc" },
      });

      // ETag based on max version
      const maxVersion = cards.reduce(
        (max, c) => Math.max(max, c.version),
        sinceVersion,
      );
      reply.header("ETag", `"v${maxVersion}"`);

      return reply.send({ cards, version: maxVersion });
    },
  );
}
