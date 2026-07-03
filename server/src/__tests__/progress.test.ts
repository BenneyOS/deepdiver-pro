import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/auth.js";
import { authRoutes } from "../routes/auth.js";
import { progressRoutes } from "../routes/progress.js";
import { cardRoutes } from "../routes/cards.js";

const app = Fastify();
let jwt: string;
let userId: string;

beforeAll(async () => {
  await app.register(cors);
  await app.register(authRoutes);
  await app.register(progressRoutes);
  await app.register(cardRoutes);
  await app.ready();

  // Create a test user
  const user = await prisma.user.create({
    data: { email: "test-progress@example.com" },
  });
  userId = user.id;
  jwt = signToken({ userId: user.id, email: user.email });

  // Ensure at least one card exists
  await prisma.card.upsert({
    where: { id: "TEST1" },
    update: {},
    create: {
      id: "TEST1",
      family: "A",
      tier: 1,
      prompt: "test",
      pattern: "test",
      rootCause: "test",
      consequence: "test",
      diagnostic: "test",
      angle: "test",
      objection: "test",
      reframe: "test",
      personaShift: { CTO: "t", VPE: "t", CFO: "t", CRO: "t" },
    },
  });
  await prisma.card.upsert({
    where: { id: "TEST2" },
    update: {},
    create: {
      id: "TEST2",
      family: "B",
      tier: 2,
      prompt: "test2",
      pattern: "test2",
      rootCause: "test2",
      consequence: "test2",
      diagnostic: "test2",
      angle: "test2",
      objection: "test2",
      reframe: "test2",
      personaShift: { CTO: "t", VPE: "t", CFO: "t", CRO: "t" },
    },
  });
});

afterAll(async () => {
  await prisma.cardProgress.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });
  await prisma.card.deleteMany({ where: { id: { in: ["TEST1", "TEST2"] } } });
  await prisma.$disconnect();
  await app.close();
});

describe("PATCH /progress reconciliation", () => {
  it("creates new progress for unseen cards", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/progress",
      headers: { authorization: `Bearer ${jwt}` },
      payload: {
        deltas: [
          {
            cardId: "TEST1",
            box: 2,
            seen: 1,
            hit: 1,
            lastAttemptAt: "2024-06-15T12:00:00Z",
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as {
      progress: Array<{ cardId: string; box: number; seen: number; hit: number }>;
    };
    expect(body.progress).toHaveLength(1);
    expect(body.progress[0].cardId).toBe("TEST1");
    expect(body.progress[0].box).toBe(2);
    expect(body.progress[0].seen).toBe(1);
    expect(body.progress[0].hit).toBe(1);
  });

  it("reconciles by taking max box and latest timestamp", async () => {
    // Server currently has box=2, seen=1, hit=1, lastAttemptAt=2024-06-15T12:00:00Z
    // Client sends box=1 (lower), seen=3 (higher), hit=2 (higher), later timestamp
    const res = await app.inject({
      method: "PATCH",
      url: "/progress",
      headers: { authorization: `Bearer ${jwt}` },
      payload: {
        deltas: [
          {
            cardId: "TEST1",
            box: 1,
            seen: 3,
            hit: 2,
            lastAttemptAt: "2024-06-16T12:00:00Z",
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as {
      progress: Array<{ cardId: string; box: number; seen: number; hit: number; lastAttemptAt: string }>;
    };
    // Should take max(2, 1) = 2 for box
    expect(body.progress[0].box).toBe(2);
    // Should take max(1, 3) = 3 for seen
    expect(body.progress[0].seen).toBe(3);
    // Should take max(1, 2) = 2 for hit
    expect(body.progress[0].hit).toBe(2);
    // Should take latest timestamp
    expect(body.progress[0].lastAttemptAt).toBe("2024-06-16T12:00:00.000Z");
  });

  it("handles batch deltas for multiple cards", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/progress",
      headers: { authorization: `Bearer ${jwt}` },
      payload: {
        deltas: [
          {
            cardId: "TEST1",
            box: 4,
            seen: 5,
            hit: 4,
            lastAttemptAt: "2024-06-17T12:00:00Z",
          },
          {
            cardId: "TEST2",
            box: 3,
            seen: 2,
            hit: 1,
            lastAttemptAt: "2024-06-17T12:00:00Z",
          },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as {
      progress: Array<{ cardId: string; box: number }>;
    };
    expect(body.progress).toHaveLength(2);
    expect(body.progress[0].box).toBe(4);
    expect(body.progress[1].box).toBe(3);
  });

  it("returns 401 without auth", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: "/progress",
      payload: { deltas: [] },
    });
    expect(res.statusCode).toBe(401);
  });
});

describe("GET /progress", () => {
  it("returns all progress for authenticated user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/progress",
      headers: { authorization: `Bearer ${jwt}` },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload) as {
      progress: Array<{ cardId: string }>;
    };
    expect(body.progress.length).toBeGreaterThanOrEqual(2);
  });
});
