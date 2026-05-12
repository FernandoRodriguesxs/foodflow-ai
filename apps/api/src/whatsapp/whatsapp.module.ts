import { Module } from "@nestjs/common";
import { WhatsAppWebhookController } from "./whatsapp-webhook.controller";
import { ConversationService } from "./conversation.service";
import { ConversationRepository } from "./conversation.repository";
import { StoreByWhatsAppResolver } from "./store-by-whatsapp.resolver";

@Module({
  controllers: [WhatsAppWebhookController],
  providers: [ConversationService, ConversationRepository, StoreByWhatsAppResolver],
  exports: [ConversationService],
})
export class WhatsAppModule {}
