import { createIncomingMessage } from "../whatsapp-message.factory";
import {
  FAKE_MESSAGE_TEXT,
  FAKE_SENDER_WHATSAPP,
  FAKE_STORE_WHATSAPP,
  createFakeWebhookPayload,
} from "./fixtures";

describe("createIncomingMessage", () => {
  it("should map instance to storeWhatsApp", () => {
    const payload = createFakeWebhookPayload();

    const incoming = createIncomingMessage(payload);

    expect(incoming.storeWhatsApp.value).toBe(FAKE_STORE_WHATSAPP);
  });

  it("should extract sender number from remoteJid", () => {
    const payload = createFakeWebhookPayload();

    const incoming = createIncomingMessage(payload);

    expect(incoming.senderWhatsApp.value).toBe(FAKE_SENDER_WHATSAPP);
  });

  it("should map message conversation to content", () => {
    const payload = createFakeWebhookPayload();

    const incoming = createIncomingMessage(payload);

    expect(incoming.content.value).toBe(FAKE_MESSAGE_TEXT);
  });

  it("should set receivedAt to current time", () => {
    const before = Date.now();

    const incoming = createIncomingMessage(createFakeWebhookPayload());

    expect(incoming.receivedAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it("should return a frozen object preserving the raw payload", () => {
    const payload = createFakeWebhookPayload();

    const incoming = createIncomingMessage(payload);

    expect(Object.isFrozen(incoming)).toBe(true);
    expect(incoming.raw).toBe(payload);
  });

  it("should reject payload with empty conversation text", () => {
    const payload = createFakeWebhookPayload({
      data: { key: { remoteJid: "5511@s.whatsapp.net" }, message: { conversation: "" } },
    });

    expect(() => createIncomingMessage(payload)).toThrow(/non-empty/);
  });
});
