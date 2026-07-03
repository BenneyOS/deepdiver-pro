const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem("rtr_jwt", token);
  } else {
    localStorage.removeItem("rtr_jwt");
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem("rtr_jwt");
  }
  return authToken;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `API error ${res.status}`,
    );
  }

  return res.json() as Promise<T>;
}

// Auth
export async function requestMagicLink(
  email: string,
): Promise<{ message: string; magicLink?: string; token?: string }> {
  return apiFetch("/auth/magic-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyMagicLink(
  token: string,
): Promise<{ jwt: string; userId: string }> {
  const result = await apiFetch<{ jwt: string; userId: string }>(
    "/auth/verify",
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
  );
  setAuthToken(result.jwt);
  return result;
}

// Progress
interface ProgressResponse {
  progress: Array<{
    cardId: string;
    box: number;
    seen: number;
    hit: number;
    nextDueAt: string | null;
    lastAttemptAt: string | null;
  }>;
}

export async function fetchProgress(): Promise<ProgressResponse> {
  return apiFetch<ProgressResponse>("/progress");
}

interface ProgressDelta {
  cardId: string;
  box: number;
  seen: number;
  hit: number;
  lastAttemptAt: string;
}

export async function syncProgress(
  deltas: ProgressDelta[],
): Promise<ProgressResponse> {
  return apiFetch<ProgressResponse>("/progress", {
    method: "PATCH",
    body: JSON.stringify({ deltas }),
  });
}

// Sessions
interface SessionPayload {
  mode: string;
  score: number;
  total: number;
  hits: number;
  maxStreak: number;
  answers: Array<{
    cardId: string;
    correct: boolean;
    tier: number;
    wager: string;
  }>;
}

export async function recordSession(
  payload: SessionPayload,
): Promise<{ sessionId: string }> {
  return apiFetch<{ sessionId: string }>("/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout(): void {
  setAuthToken(null);
}
