import { Module } from "@nestjs/common";
import { DRIZZLE_TOKEN } from "@database/database.constants";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { AUTH_INSTANCE_TOKEN } from "./auth.constants";
import { createAuthInstance } from "./auth.instance";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { BetterAuthAdapter } from "./better-auth-adapter";
import { StoreRegistrationService } from "./store-registration.service";

function createAuthProvider() {
  return {
    provide: AUTH_INSTANCE_TOKEN,
    useFactory: (database: NeonHttpDatabase) => createAuthInstance(database),
    inject: [DRIZZLE_TOKEN],
  };
}

@Module({
  providers: [createAuthProvider(), AuthService, BetterAuthAdapter, StoreRegistrationService],
  controllers: [AuthController],
  exports: [AUTH_INSTANCE_TOKEN],
})
export class AuthModule {}
