const DEFAULT_API_URL = "http://localhost:3001";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export const AUTH_COOKIE_NAME = "foodflow_token";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
