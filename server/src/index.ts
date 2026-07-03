import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { authRoutes } from "./routes/auth.js";
import { cardRoutes } from "./routes/cards.js";
import { progressRoutes } from "./routes/progress.js";
import { sessionRoutes } from "./routes/sessions.js";
import { adminRoutes } from "./routes/admin.js";

const app = Fastify({ logger: true });

async function start(): Promise<void> {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  await app.register(authRoutes);
  await app.register(cardRoutes);
  await app.register(progressRoutes);
  await app.register(sessionRoutes);
  await app.register(adminRoutes);

  app.get("/health", async () => ({ status: "ok" }));

  const port = Number(process.env.PORT) || 3001;
  await app.listen({ port, host: "0.0.0.0" });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

export { app };
