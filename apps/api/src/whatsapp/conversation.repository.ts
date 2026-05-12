import { Injectable } from "@nestjs/common";
import { TenantDatabaseService } from "@tenant/tenant-database.service";
import type { StoreId } from "@shared/value-objects/store-id";
import type { WhatsAppNumber } from "@whatsapp/value-objects/whatsapp-number";
import type { ConversationMessageRecord } from "./whatsapp.types";
import {
  appendMessageToConversation,
  createConversationWithMessage,
  findActiveConversation,
} from "./conversation-persistence.helpers";

@Injectable()
export class ConversationRepository {
  constructor(private readonly tenantDatabase: TenantDatabaseService) {}

  async appendIncomingMessage(
    storeId: StoreId,
    sender: WhatsAppNumber,
    record: ConversationMessageRecord,
  ): Promise<string> {
    return this.tenantDatabase.executeWithTenant(storeId.value, async (db) => {
      const existing = await findActiveConversation(db, storeId, sender);
      if (existing) {
        await appendMessageToConversation(db, existing.id, record);
        return existing.id;
      }
      return createConversationWithMessage(db, storeId, sender, record);
    });
  }
}
