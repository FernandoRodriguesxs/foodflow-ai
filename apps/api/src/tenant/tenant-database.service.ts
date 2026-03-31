import { Inject, Injectable } from "@nestjs/common";
import { sql } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { DRIZZLE_TOKEN } from "@database/database.constants";

@Injectable()
export class TenantDatabaseService {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly database: NeonHttpDatabase,
  ) {}

  async executeWithTenant<TResult>(
    storeId: string,
    operation: (transaction: NeonHttpDatabase) => Promise<TResult>,
  ): Promise<TResult> {
    return this.database.transaction(async (transaction) => {
      await transaction.execute(
        sql`SELECT set_config('app.current_store_id', ${storeId}, true)`,
      );
      return operation(transaction as unknown as NeonHttpDatabase);
    });
  }
}
