import { Inject, Injectable } from "@nestjs/common";
import { DRIZZLE_TOKEN } from "@database/database.constants";
import { stores } from "@database/schemas/stores.schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

@Injectable()
export class StoreRegistrationService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly database: NeonHttpDatabase,
  ) {}

  async createStore(name: string, slug: string) {
    const [store] = await this.database
      .insert(stores)
      .values({ name, slug })
      .returning();
    return store;
  }
}
