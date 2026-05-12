import { buildWhatsAppRawOrder } from "../whatsapp-order.adapter";
import type { ParsedWhatsAppOrder } from "../whatsapp-nlp.types";
import {
  FAKE_SENDER_WHATSAPP,
  FAKE_STORE_ID,
  FAKE_STORE_ID_VO,
  createFakeIncomingMessage,
} from "./fixtures";

function buildParsedOrder(overrides?: Partial<ParsedWhatsAppOrder>): ParsedWhatsAppOrder {
  return Object.freeze({
    isOrder: true,
    items: [
      { name: "pizza margherita", quantity: 2 },
      { name: "coca-cola", quantity: 1, notes: "lata" },
    ],
    customerName: "Maria",
    ...overrides,
  });
}

describe("buildWhatsAppRawOrder", () => {
  it("should map store id and sender phone correctly", () => {
    const incoming = createFakeIncomingMessage();

    const raw = buildWhatsAppRawOrder(FAKE_STORE_ID_VO, incoming, buildParsedOrder());

    expect(raw.storeId).toBe(FAKE_STORE_ID);
    expect(raw.customerPhone).toBe(FAKE_SENDER_WHATSAPP);
  });

  it("should generate a unique externalId prefixed with whatsapp", () => {
    const incoming = createFakeIncomingMessage();

    const first = buildWhatsAppRawOrder(FAKE_STORE_ID_VO, incoming, buildParsedOrder());
    const second = buildWhatsAppRawOrder(FAKE_STORE_ID_VO, incoming, buildParsedOrder());

    expect(first.externalId).toMatch(/^whatsapp:/);
    expect(first.externalId).not.toBe(second.externalId);
  });

  it("should default customer name when not provided by NLP", () => {
    const incoming = createFakeIncomingMessage();

    const raw = buildWhatsAppRawOrder(FAKE_STORE_ID_VO, incoming, buildParsedOrder({ customerName: undefined }));

    expect(raw.customerName).toBe("Cliente WhatsApp");
  });

  it("should use NLP customer name when available", () => {
    const incoming = createFakeIncomingMessage();

    const raw = buildWhatsAppRawOrder(FAKE_STORE_ID_VO, incoming, buildParsedOrder());

    expect(raw.customerName).toBe("Maria");
  });

  it("should map items preserving quantity and notes with zero unit price", () => {
    const incoming = createFakeIncomingMessage();

    const raw = buildWhatsAppRawOrder(FAKE_STORE_ID_VO, incoming, buildParsedOrder());

    expect(raw.items).toHaveLength(2);
    expect(raw.items[0]).toEqual({ name: "pizza margherita", quantity: 2, unitPrice: 0, notes: undefined });
    expect(raw.items[1]).toEqual({ name: "coca-cola", quantity: 1, unitPrice: 0, notes: "lata" });
  });

  it("should set total to zero awaiting operator review", () => {
    const incoming = createFakeIncomingMessage();

    const raw = buildWhatsAppRawOrder(FAKE_STORE_ID_VO, incoming, buildParsedOrder());

    expect(raw.total).toBe(0);
  });

  it("should preserve the raw webhook payload", () => {
    const incoming = createFakeIncomingMessage();

    const raw = buildWhatsAppRawOrder(FAKE_STORE_ID_VO, incoming, buildParsedOrder());

    expect(raw.rawData).toBe(incoming.raw);
  });

  it("should return a frozen object", () => {
    const incoming = createFakeIncomingMessage();

    const raw = buildWhatsAppRawOrder(FAKE_STORE_ID_VO, incoming, buildParsedOrder());

    expect(Object.isFrozen(raw)).toBe(true);
  });
});
