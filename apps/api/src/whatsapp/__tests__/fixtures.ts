import { StoreId } from "@shared/value-objects/store-id";
import { WhatsAppNumber } from "@whatsapp/value-objects/whatsapp-number";
import { MessageContent } from "@whatsapp/value-objects/message-content";
import type {
  ConversationMessageRecord,
  IncomingWhatsAppMessage,
  WhatsAppWebhookPayload,
} from "../whatsapp.types";

export const FAKE_STORE_ID = "store-uuid-abc";
export const FAKE_STORE_ID_VO = StoreId.create(FAKE_STORE_ID);
export const FAKE_STORE_WHATSAPP = "5511988887777";
export const FAKE_SENDER_WHATSAPP = "5511999998888";
export const FAKE_SENDER_REMOTE_JID = `${FAKE_SENDER_WHATSAPP}@s.whatsapp.net`;
export const FAKE_MESSAGE_TEXT = "Quero 2 pizzas margherita";
export const FAKE_CONVERSATION_ID = "conversation-uuid-001";
export const FAKE_RECEIVED_AT = new Date("2026-05-12T15:00:00Z");

export function createFakeWebhookPayload(
  overrides?: Partial<WhatsAppWebhookPayload>,
): WhatsAppWebhookPayload {
  return {
    instance: FAKE_STORE_WHATSAPP,
    data: {
      key: { remoteJid: FAKE_SENDER_REMOTE_JID },
      message: { conversation: FAKE_MESSAGE_TEXT },
    },
    ...overrides,
  };
}

export function createFakeIncomingMessage(): IncomingWhatsAppMessage {
  return Object.freeze({
    storeWhatsApp: WhatsAppNumber.create(FAKE_STORE_WHATSAPP),
    senderWhatsApp: WhatsAppNumber.create(FAKE_SENDER_WHATSAPP),
    content: MessageContent.create(FAKE_MESSAGE_TEXT),
    receivedAt: FAKE_RECEIVED_AT,
    raw: createFakeWebhookPayload(),
  });
}

export function createFakeMessageRecord(): ConversationMessageRecord {
  return Object.freeze({
    from: FAKE_SENDER_WHATSAPP,
    content: FAKE_MESSAGE_TEXT,
    receivedAt: FAKE_RECEIVED_AT.toISOString(),
    direction: "inbound",
  });
}
