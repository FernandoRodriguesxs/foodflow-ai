import { Injectable } from "@nestjs/common";
import { BetterAuthAdapter } from "./better-auth-adapter";
import { StoreRegistrationService } from "./store-registration.service";
import type { RegisterInput, LoginInput } from "./auth.types";

@Injectable()
export class AuthService {
  constructor(
    private readonly betterAuth: BetterAuthAdapter,
    private readonly storeRegistration: StoreRegistrationService,
  ) {}

  async register(input: RegisterInput) {
    const store = await this.storeRegistration.createStore(input.storeName, input.storeSlug);
    const signUpResult = await this.betterAuth.signUp(input, store.id);
    const jwtToken = await this.betterAuth.exchangeForJwt(signUpResult.token ?? "");
    return { user: signUpResult.user, store, token: jwtToken };
  }

  async login(input: LoginInput) {
    const signInResult = await this.betterAuth.signIn(input);
    const jwtToken = await this.betterAuth.exchangeForJwt(signInResult.token ?? "");
    return { user: signInResult.user, token: jwtToken };
  }
}
