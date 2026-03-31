import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { DATABASE_ID_STRATEGY, DEFAULT_USER_ROLE } from "./auth.constants";
import * as authSchema from "./auth.schema";

export function createAuthInstance(database: NeonHttpDatabase) {
  return betterAuth({
    database: drizzleAdapter(database, {
      provider: "pg",
      schema: authSchema,
    }),
    emailAndPassword: { enabled: true },
    user: {
      modelName: "users",
      additionalFields: {
        storeId: { type: "string", required: true, fieldName: "store_id" },
        role: { type: "string", defaultValue: DEFAULT_USER_ROLE, fieldName: "role" },
      },
    },
    session: { modelName: "sessions" },
    account: { modelName: "accounts" },
    verification: { modelName: "verifications" },
    plugins: [
      jwt({
        jwt: {
          definePayload: async ({ user }) => ({
            sub: user.id,
            storeId: user["storeId"] as string,
            role: user["role"] as string,
          }),
        },
      }),
    ],
    advanced: {
      database: { generateId: DATABASE_ID_STRATEGY },
      disableCSRFCheck: true,
    },
  });
}

export type AuthInstance = ReturnType<typeof createAuthInstance>;
