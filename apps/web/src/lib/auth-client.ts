import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  getApiBaseUrl,
} from "./api-config";

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface RegisterInput {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly storeName: string;
  readonly storeSlug: string;
}

interface AuthResponse {
  readonly token: string;
  readonly user: Record<string, unknown>;
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  const response = await request("/api/auth/login", input);
  persistToken(response.token);
  return response;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const response = await request("/api/auth/register", input);
  persistToken(response.token);
  return response;
}

export function logout(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function getStoredToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function request(path: string, body: unknown): Promise<AuthResponse> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
  return response.json();
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.message ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

function persistToken(token: string): void {
  if (typeof document === "undefined") return;
  const maxAge = AUTH_COOKIE_MAX_AGE_SECONDS;
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
}
