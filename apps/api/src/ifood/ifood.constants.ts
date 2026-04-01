export const IFOOD_EVENT_QUEUE = "ifood-events";
export const PROCESS_IFOOD_EVENT_JOB = "process-ifood-event";
export const IFOOD_POLLING_QUEUE = "ifood-polling";
export const IFOOD_POLLING_JOB = "ifood-poll-events";
export const IFOOD_POLLING_INTERVAL_MS = 30_000;
export const IFOOD_TOKEN_CACHE_KEY = "ifood:oauth:token";
export const IFOOD_TOKEN_SAFETY_MARGIN_SECONDS = 60;
export const IFOOD_REDIS_TOKEN = Symbol("IFOOD_REDIS_TOKEN");
export const IFOOD_ORDER_PATH = "/order/v1.0/orders";
export const IFOOD_PLACED_EVENT_CODE = "PLACED";

const DEFAULT_REDIS_PORT = 6379;

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} environment variable is not set`);
  return value;
}

export function getRedisUrl(): string {
  return getRequiredEnv("REDIS_URL");
}

export function getIFoodApiBaseUrl(): string {
  return getRequiredEnv("IFOOD_API_BASE_URL");
}

export function getIFoodClientId(): string {
  return getRequiredEnv("IFOOD_CLIENT_ID");
}

export function getIFoodClientSecret(): string {
  return getRequiredEnv("IFOOD_CLIENT_SECRET");
}

export function parseRedisConnection() {
  const parsed = new URL(getRedisUrl());
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || DEFAULT_REDIS_PORT,
    password: parsed.password || undefined,
  };
}
