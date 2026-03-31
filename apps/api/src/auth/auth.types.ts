export interface RegisterInput {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly storeName: string;
  readonly storeSlug: string;
}

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

export interface AuthenticatedUser {
  readonly userId: string;
  readonly storeId: string;
  readonly role: string;
}

export interface SignUpResult {
  readonly token: string | null;
  readonly user: Record<string, unknown>;
}

export interface TokenResult {
  readonly token: string;
}

import { FIELD_STORE_ID, FIELD_ROLE } from "./auth.constants";

export function createAuthenticatedUser(
  session: { user: { id: string } & Record<string, unknown> },
): AuthenticatedUser {
  return Object.freeze({
    userId: session.user.id,
    storeId: session.user[FIELD_STORE_ID] as string,
    role: session.user[FIELD_ROLE] as string,
  });
}
