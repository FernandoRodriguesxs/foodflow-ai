import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ConversationService } from "./conversation.service";
import { WhatsAppOrderProcessor } from "./whatsapp-order.processor";
import { createIncomingMessage } from "./whatsapp-message.factory";
import type { WhatsAppWebhookPayload } from "./whatsapp.types";

@Controller("api/webhooks/whatsapp")
export class WhatsAppWebhookController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly orderProcessor: WhatsAppOrderProcessor,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async receiveMessage(@Body() payload: WhatsAppWebhookPayload): Promise<void> {
    const incoming = createIncomingMessage(payload);
    const persisted = await this.conversationService.persistIncomingMessage(incoming);
    await this.orderProcessor.processIfOrder(persisted.storeId, persisted.conversationId, incoming);
  }
}
