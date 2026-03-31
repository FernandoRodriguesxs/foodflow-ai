export const DRIZZLE_TOKEN = Symbol("DRIZZLE_TOKEN");

const DATABASE_URL_ENV_KEY = "DATABASE_URL";

export function getDatabaseUrl(): string {
  const databaseUrl = process.env[DATABASE_URL_ENV_KEY];
  if (!databaseUrl) {
    throw new Error(`${DATABASE_URL_ENV_KEY} environment variable is not set`);
  }
  return databaseUrl;
}
