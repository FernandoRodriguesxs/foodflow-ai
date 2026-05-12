import { Module } from "@nestjs/common";
import Anthropic from "@anthropic-ai/sdk";
import { OrdersModule } from "@orders/orders.module";
import { WhatsAppWebhookController } from "./whatsapp-webhook.controller";
import { ConversationService } from "./conversation.service";
import { ConversationRepository } from "./conversation.repository";
import { StoreByWhatsAppResolver } from "./store-by-whatsapp.resolver";
import { WhatsAppNlpService } from "./whatsapp-nlp.service";
import { WhatsAppOrderProcessor } from "./whatsapp-order.processor";
import {
  ANTHROPIC_CLIENT_TOKEN,
  getAnthropicApiKey,
} from "./whatsapp-nlp.constants";

@Module({
  imports: [OrdersModule],
  controllers: [WhatsAppWebhookController],
  providers: [
    ConversationService,
    ConversationRepository,
    StoreByWhatsAppResolver,
    WhatsAppNlpService,
    WhatsAppOrderProcessor,
    {
      provide: ANTHROPIC_CLIENT_TOKEN,
      useFactory: () => new Anthropic({ apiKey: getAnthropicApiKey() }),
    },
  ],
  exports: [ConversationService, WhatsAppNlpService, WhatsAppOrderProcessor],
})
export class WhatsAppModule {}
