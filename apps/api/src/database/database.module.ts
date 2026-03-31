import { Global, Module } from "@nestjs/common";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { DRIZZLE_TOKEN, getDatabaseUrl } from "./database.constants";

function createDrizzleProvider() {
  return {
    provide: DRIZZLE_TOKEN,
    useFactory: () => {
      const client = neon(getDatabaseUrl());
      return drizzle({ client });
    },
  };
}

@Global()
@Module({
  providers: [createDrizzleProvider()],
  exports: [DRIZZLE_TOKEN],
})
export class DatabaseModule {}
