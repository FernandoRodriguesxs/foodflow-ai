import { Injectable } from "@nestjs/common";
import { OrderNormalizerService } from "@orders/order-normalizer.service";
import { WhatsAppNlpService } from "./whatsapp-nlp.service";
import { ConversationRepository } from "./conversation.repository";
import { buildWhatsAppRawOrder } from "./whatsapp-order.adapter";
import type { StoreId } from "@shared/value-objects/store-id";
import type { IncomingWhatsAppMessage } from "./whatsapp.types";

@Injectable()
export class WhatsAppOrderProcessor {
  constructor(
    private readonly nlpService: WhatsAppNlpService,
    private readonly normalizer: OrderNormalizerService,
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async processIfOrder(
    storeId: StoreId,
    conversationId: string,
    incoming: IncomingWhatsAppMessage,
  ): Promise<void> {
    const parsed = await this.nlpService.extractOrder(incoming.content);
    if (!parsed.isOrder) {
      return;
    }
    const rawOrder = buildWhatsAppRawOrder(storeId, incoming, parsed);
    const createdOrder = await this.normalizer.normalizeWhatsAppOrder(rawOrder);
    await this.conversationRepository.linkOrder(storeId, conversationId, createdOrder.id);
  }
}
