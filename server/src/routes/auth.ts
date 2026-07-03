import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { generateMagicToken, signToken } from "../lib/auth.js";

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Request magic link
  app.post<{ Body: { email: string } }>(
    "/auth/magic-link",
    async (request, reply) => {
      const { email } = request.body;
      if (!email || typeof email !== "string") {
        return reply.code(400).send({ error: "Email is required" });
      }

      // Upsert user
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email },
      });

      // Create magic token
      const token = generateMagicToken();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

      await prisma.magicToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // In production, send email. For dev, return token directly.
      const magicLinkUrl = `${process.env.MAGIC_LINK_BASE_URL ?? "http://localhost:5173"}/auth/verify?token=${token}`;

      return reply.send({
        message: "Magic link sent",
        // Dev only: include link for testing
        ...(process.env.NODE_ENV !== "production" && { magicLink: magicLinkUrl, token }),
      });
    },
  );

  // Verify magic link token → JWT
  app.post<{ Body: { token: string } }>(
    "/auth/verify",
    async (request, reply) => {
      const { token } = request.body;
      if (!token) {
        return reply.code(400).send({ error: "Token is required" });
      }

      const magicToken = await prisma.magicToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!magicToken) {
        return reply.code(401).send({ error: "Invalid token" });
      }

      if (magicToken.used) {
        return reply.code(401).send({ error: "Token already used" });
      }

      if (magicToken.expiresAt < new Date()) {
        return reply.code(401).send({ error: "Token expired" });
      }

      // Mark token as used
      await prisma.magicToken.update({
        where: { id: magicToken.id },
        data: { used: true },
      });

      // Issue JWT
      const jwt = signToken({
        userId: magicToken.user.id,
        email: magicToken.user.email,
      });

      return reply.send({ jwt, userId: magicToken.user.id });
    },
  );
}
