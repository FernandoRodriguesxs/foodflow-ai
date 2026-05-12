import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { DRIZZLE_TOKEN } from "@database/database.constants";
import { stores } from "@database/schemas/stores.schema";
import { StoreId } from "@shared/value-objects/store-id";
import type { WhatsAppNumber } from "@whatsapp/value-objects/whatsapp-number";

const STORE_NOT_FOUND = "Store not found for the given WhatsApp number";

@Injectable()
export class StoreByWhatsAppResolver {
  constructor(
    @Inject(DRIZZLE_TOKEN) private readonly database: NeonHttpDatabase,
  ) {}

  async resolveStoreId(whatsappNumber: WhatsAppNumber): Promise<StoreId> {
    const results = await this.database
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.whatsappNumber, whatsappNumber.value))
      .limit(1);

    if (results.length === 0) {
      throw new NotFoundException(STORE_NOT_FOUND);
    }
    return StoreId.create(results[0].id);
  }
}
