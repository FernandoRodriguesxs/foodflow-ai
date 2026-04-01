export const IFOOD_EVENT_QUEUE = "ifood-events";
export const PROCESS_IFOOD_EVENT_JOB = "process-ifood-event";

const REDIS_URL_ENV_KEY = "REDIS_URL";
const DEFAULT_REDIS_PORT = 6379;

export function getRedisUrl(): string {
  const redisUrl = process.env[REDIS_URL_ENV_KEY];
  if (!redisUrl) {
    throw new Error(`${REDIS_URL_ENV_KEY} environment variable is not set`);
  }
  return redisUrl;
}

export function parseRedisConnection() {
  const parsed = new URL(getRedisUrl());
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || DEFAULT_REDIS_PORT,
    password: parsed.password || undefined,
  };
}
