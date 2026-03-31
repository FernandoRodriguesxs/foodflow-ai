import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import {
  AUTH_INSTANCE_TOKEN,
  ERROR_INVALID_CREDENTIALS,
  USER_ROLE_OWNER,
} from "./auth.constants";
import type { AuthInstance } from "./auth.instance";
import { StoreRegistrationService } from "./store-registration.service";
import type {
  RegisterInput,
  LoginInput,
  SignUpResult,
  TokenResult,
} from "./auth.types";

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_INSTANCE_TOKEN) private readonly auth: AuthInstance,
    private readonly storeRegistration: StoreRegistrationService,
  ) {}

  async register(input: RegisterInput) {
    const store = await this.storeRegistration.createStore(input.storeName, input.storeSlug);
    const signUpResult = await this.callSignUp(input, store.id);
    const jwtToken = await this.exchangeForJwt(signUpResult.token ?? "");
    return { user: signUpResult.user, store, token: jwtToken };
  }

  async login(input: LoginInput) {
    const signInResult = await this.callSignIn(input);
    const jwtToken = await this.exchangeForJwt(signInResult.token ?? "");
    return { user: signInResult.user, token: jwtToken };
  }

  private async callSignUp(input: RegisterInput, storeId: string) {
    const body = {
      email: input.email,
      password: input.password,
      name: input.name,
      storeId,
      role: USER_ROLE_OWNER,
    };
    return (this.auth.api.signUpEmail as CallableFunction)({ body }) as Promise<SignUpResult>;
  }

  private async callSignIn(input: LoginInput) {
    const result = await (this.auth.api.signInEmail as CallableFunction)({
      body: { email: input.email, password: input.password },
    });
    const signInResult = result as SignUpResult;
    if (!signInResult.token) {
      throw new UnauthorizedException(ERROR_INVALID_CREDENTIALS);
    }
    return signInResult;
  }

  private async exchangeForJwt(sessionToken: string) {
    const headers = new Headers({ authorization: `Bearer ${sessionToken}` });
    const result = await (this.auth.api.getToken as CallableFunction)({ headers });
    return (result as TokenResult).token;
  }
}
