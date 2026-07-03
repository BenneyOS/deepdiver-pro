import type { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "../lib/auth.js";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    userEmail?: string;
  }
}

export async function authGuard(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    reply.code(401).send({ error: "Missing or invalid Authorization header" });
    return;
  }

  try {
    const token = header.slice(7);
    const payload = verifyToken(token);
    request.userId = payload.userId;
    request.userEmail = payload.email;
  } catch {
    reply.code(401).send({ error: "Invalid or expired token" });
  }
}
