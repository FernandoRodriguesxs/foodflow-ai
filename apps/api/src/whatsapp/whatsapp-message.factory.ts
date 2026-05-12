import { WhatsAppNumber } from "@whatsapp/value-objects/whatsapp-number";
import { MessageContent } from "@whatsapp/value-objects/message-content";
import type {
  IncomingWhatsAppMessage,
  WhatsAppWebhookPayload,
} from "./whatsapp.types";

export function createIncomingMessage(
  payload: WhatsAppWebhookPayload,
): IncomingWhatsAppMessage {
  return Object.freeze({
    storeWhatsApp: WhatsAppNumber.create(payload.instance),
    senderWhatsApp: WhatsAppNumber.fromRemoteJid(payload.data.key.remoteJid),
    content: MessageContent.create(payload.data.message.conversation),
    receivedAt: new Date(),
    raw: payload,
  });
}
