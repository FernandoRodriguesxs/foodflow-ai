import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { DRIZZLE_TOKEN } from "@database/database.constants";
import { stores } from "@database/schemas/stores.schema";
import type { MerchantId } from "@ifood/value-objects/merchant-id";
import { StoreId } from "@ifood/value-objects/store-id";

const STORE_NOT_FOUND = "Store not found for the given iFood merchant ID";

@Injectable()
export class MerchantStoreResolver {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly database: NeonHttpDatabase,
  ) {}

  async resolveStoreId(merchantId: MerchantId): Promise<StoreId> {
    const results = await this.database
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.ifoodMerchantId, merchantId.value))
      .limit(1);

    if (results.length === 0) {
      throw new NotFoundException(STORE_NOT_FOUND);
    }

    return StoreId.create(results[0].id);
  }
}
