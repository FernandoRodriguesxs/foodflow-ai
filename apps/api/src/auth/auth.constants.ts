import { USER_ROLE_VALUES } from "@database/schemas/enum-values";

export const AUTH_INSTANCE_TOKEN = Symbol("AUTH_INSTANCE_TOKEN");

export const USER_ROLE_OWNER = USER_ROLE_VALUES[0];
export const DEFAULT_USER_ROLE = USER_ROLE_VALUES[1];
export const DATABASE_ID_STRATEGY = "uuid" as const;
export const ERROR_INVALID_TOKEN = "Invalid or missing authentication token";
export const ERROR_INVALID_CREDENTIALS = "Invalid credentials";

export const FIELD_STORE_ID = "storeId";
export const FIELD_ROLE = "role";

const BETTER_AUTH_SECRET_KEY = "BETTER_AUTH_SECRET";

export function getAuthSecret(): string {
  const secret = process.env[BETTER_AUTH_SECRET_KEY];
  if (!secret) {
    throw new Error(
      `${BETTER_AUTH_SECRET_KEY} environment variable is not set`,
    );
  }
  return secret;
}
