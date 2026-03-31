import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import {
  AUTH_INSTANCE_TOKEN,
  ERROR_INVALID_CREDENTIALS,
  USER_ROLE_OWNER,
} from "./auth.constants";
import type { AuthInstance } from "./auth.instance";
import type { RegisterInput, LoginInput, SignUpResult, TokenResult } from "./auth.types";

@Injectable()
export class BetterAuthAdapter {
  constructor(
    @Inject(AUTH_INSTANCE_TOKEN) private readonly auth: AuthInstance,
  ) {}

  async signUp(input: RegisterInput, storeId: string): Promise<SignUpResult> {
    const body = {
      email: input.email,
      password: input.password,
      name: input.name,
      storeId,
      role: USER_ROLE_OWNER,
    };
    return (this.auth.api.signUpEmail as CallableFunction)({ body }) as Promise<SignUpResult>;
  }

  async signIn(input: LoginInput): Promise<SignUpResult> {
    const result = await (this.auth.api.signInEmail as CallableFunction)({
      body: { email: input.email, password: input.password },
    });
    const signInResult = result as SignUpResult;
    if (!signInResult.token) {
      throw new UnauthorizedException(ERROR_INVALID_CREDENTIALS);
    }
    return signInResult;
  }

  async exchangeForJwt(sessionToken: string): Promise<string> {
    const headers = new Headers({ authorization: `Bearer ${sessionToken}` });
    const result = await (this.auth.api.getToken as CallableFunction)({ headers });
    return (result as TokenResult).token;
  }
}
