import { Injectable } from "@nestjs/common";
import { StoreByWhatsAppResolver } from "./store-by-whatsapp.resolver";
import { ConversationRepository } from "./conversation.repository";
import type {
  ConversationMessageRecord,
  IncomingWhatsAppMessage,
  PersistedConversation,
} from "./whatsapp.types";

@Injectable()
export class ConversationService {
  constructor(
    private readonly storeResolver: StoreByWhatsAppResolver,
    private readonly repository: ConversationRepository,
  ) {}

  async persistIncomingMessage(
    incoming: IncomingWhatsAppMessage,
  ): Promise<PersistedConversation> {
    const storeId = await this.storeResolver.resolveStoreId(incoming.storeWhatsApp);
    const record = buildMessageRecord(incoming);
    const conversationId = await this.repository.appendIncomingMessage(
      storeId,
      incoming.senderWhatsApp,
      record,
    );
    return Object.freeze({ conversationId, storeId });
  }
}

function buildMessageRecord(
  incoming: IncomingWhatsAppMessage,
): ConversationMessageRecord {
  return Object.freeze({
    from: incoming.senderWhatsApp.value,
    content: incoming.content.value,
    receivedAt: incoming.receivedAt.toISOString(),
    direction: "inbound",
  });
}
