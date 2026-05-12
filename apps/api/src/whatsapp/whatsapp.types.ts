import type { WhatsAppNumber } from "@whatsapp/value-objects/whatsapp-number";
import type { MessageContent } from "@whatsapp/value-objects/message-content";
import type { StoreId } from "@shared/value-objects/store-id";

export interface WhatsAppWebhookKey {
  readonly remoteJid: string;
}

export interface WhatsAppWebhookMessage {
  readonly conversation: string;
}

export interface WhatsAppWebhookData {
  readonly key: WhatsAppWebhookKey;
  readonly message: WhatsAppWebhookMessage;
}

export interface WhatsAppWebhookPayload {
  readonly instance: string;
  readonly data: WhatsAppWebhookData;
}

export interface IncomingWhatsAppMessage {
  readonly storeWhatsApp: WhatsAppNumber;
  readonly senderWhatsApp: WhatsAppNumber;
  readonly content: MessageContent;
  readonly receivedAt: Date;
  readonly raw: WhatsAppWebhookPayload;
}

export type MessageDirection = "inbound" | "outbound";

export interface ConversationMessageRecord {
  readonly from: string;
  readonly content: string;
  readonly receivedAt: string;
  readonly direction: MessageDirection;
}

export interface PersistedConversation {
  readonly conversationId: string;
  readonly storeId: StoreId;
}
