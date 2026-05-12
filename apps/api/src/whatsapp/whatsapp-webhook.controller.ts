import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ConversationService } from "./conversation.service";
import { createIncomingMessage } from "./whatsapp-message.factory";
import type { WhatsAppWebhookPayload } from "./whatsapp.types";

@Controller("api/webhooks/whatsapp")
export class WhatsAppWebhookController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async receiveMessage(@Body() payload: WhatsAppWebhookPayload): Promise<void> {
    const incoming = createIncomingMessage(payload);
    await this.conversationService.persistIncomingMessage(incoming);
  }
}
